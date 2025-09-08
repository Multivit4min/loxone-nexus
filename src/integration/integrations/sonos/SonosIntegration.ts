import z from "zod"
import { IntegrationEntry } from "../../IntegrationEntry"
import { Integration, IntegrationVariable as VariableEntity } from "@prisma/client"
import { IntegrationVariableManager } from "../../variables/IntegrationVariableManager"
import { VariableDataTypes } from "../../../types/general"
import { IntegrationManager } from "../../IntegrationManager"
import { SonosVariable } from "./SonosVariable"
import { SonosDevice } from "@svrooij/sonos/lib"
import { GetZoneInfoResponse } from "@svrooij/sonos/lib/services"
import { SonosState } from "@svrooij/sonos/lib/models/sonos-state"

export class SonosIntegration extends IntegrationEntry<
  z.infer<ReturnType<typeof SonosIntegration.configSchema>>
> {

  device: SonosDevice
  private pollInterval?: NodeJS.Timeout
  static POLL_INTERVAL = 5 * 1000
  private zone?: GetZoneInfoResponse
  private state?: SonosState

  constructor(entity: Integration, parent: IntegrationManager) {
    super(entity, parent, SonosIntegration)
    this.device = new SonosDevice(this.config.address)
  }

  static label() {
    return "Sonos"
  }

  getConstructor() {
    return SonosIntegration
  }

  async start() {
    await this.variables.reload()
    this.pollInterval = setInterval(() => this.pollDevice(), SonosIntegration.POLL_INTERVAL)
    await this.pollDevice()
  }

  async stop() {
    clearTimeout(this.pollInterval)
  }

  private async pollDevice() {
    try {
      const [zone, state] = await Promise.all([
        this.device.GetZoneInfo(),
        this.device.GetState()
      ])
      this.zone = zone
      this.state = state
    } catch (e) {
      this.logger.warn(e, `could not poll sonos device at ${this.config.address}`)
    }
  }

  async getInternalVariables() {
    
  }

  specificSerialize() {
    return {
      zone: this.zone,
      state: this.state
    }
  }

  static createIntegrationVariable(v: VariableEntity, parent: IntegrationVariableManager) {
    return new SonosVariable(v, parent)
  }

  static filterRecordsByType(attributes: Record<string, any>, types: string[]) {
    const result: Record<string, VariableDataTypes> = {}
    Object.keys(attributes).forEach(k => {
      if (!types.includes(typeof attributes[k])) return
      result[k] = attributes[k]
    })
    return result
  }

  static icon() {
    return "mdi-cast-audio"
  }

  static getVariableSchema() {
    const tts = z.object({
      action: z.literal("tts").describe("Text to Speech Message"),
      volume: z.number().min(0).max(100).describe("Volume level in %").optional(),
      text: z.string().min(1).describe("message to say").optional(),
      provider: z.url().describe("tts provider")
    })
    const notification = z.object({
      action: z.literal("notification").describe("Play Notification"),
      volume: z.number().min(0).max(100).describe("Volume level in %").optional(),
      uri: z.string().min(1).describe("URI to play").optional()
    })
    return z.discriminatedUnion("action", [tts, notification])
  }

  static configSchema() {
    return z.object({
      address: z.ipv4().describe("address of the speaker")
    })
  }
}

export type HomeAssistantDataSourceConfig = {
  ws: string
  token: string
}