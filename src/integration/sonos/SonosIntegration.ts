import z from "zod"
import { IntegrationInstance } from "../../core/integration/IntegrationInstance"
import { IntegrationVariableManager } from "../../core/integration/variables/IntegrationVariableManager"
import { VariableDataTypes } from "../../types/general"
import { IntegrationManager } from "../../core/integration/IntegrationManager"
import { SonosVariable } from "./SonosVariable"
import { SonosDevice } from "@svrooij/sonos/lib"
import { GetZoneInfoResponse } from "@svrooij/sonos/lib/services"
import { SonosState } from "@svrooij/sonos/lib/models/sonos-state"
import { IntegrationEntity, IntegrationVariableEntity } from "../../drizzle/schema"


export class SonosIntegration extends IntegrationInstance<
  z.infer<ReturnType<typeof SonosIntegration.configSchema>>
> {

  device: SonosDevice
  private pollInterval?: NodeJS.Timeout
  static POLL_INTERVAL = 10 * 1000
  private zone?: GetZoneInfoResponse
  private state?: SonosState

  constructor(entity: IntegrationEntity, parent: IntegrationManager) {
    super(entity, parent, SonosIntegration)
    this.device = new SonosDevice(this.config.address)
    this.actions
      .create("notification")
      .describe("plays a notification on the sonos speaker")
      .schema({
        volume: z.number().min(0).max(100).describe("Volume level in %").optional(),
        uri: z.string().min(1).describe("URI to play").optional()
      })
      .execute(async props => {
        const { type } = props.value
        if (type === "null") return
        let trackUri = props.config.uri
        let volume = props.config.volume
        if (type === "string") trackUri = props.value.toString()
        if (type === "number") {
          volume = props.value.toNumber()
          if (volume > 100) volume = 100
          if (volume < 0) volume = 0
        }
        if (trackUri === undefined || trackUri.length === 0) return
        if ((type === "boolean" && !props.value.toBoolean())) return
        await this.device.PlayNotification({ trackUri,  volume })
      })
    this.actions
      .create("play")
      .describe("starts playback")
      .execute(async props => {
        if (!props.value.toBoolean()) return
        await this.device.Play()
      })
    this.actions
      .create("pause")
      .describe("pauses playback")
      .execute(async props => {
        if (!props.value.toBoolean()) return
        await this.device.Pause()
      })
    this.actions
      .create("volume")
      .describe("set volume")
      .execute(async props => {
        let volume = Math.round(props.value.toNumber())
        if (volume < 0) volume = 0
        if (volume > 100) volume = 100
        await this.device.SetVolume(volume)
      })
    this.actions
      .create("next")
      .describe("next track")
      .execute(async props => {
        if (!props.value.toBoolean()) return
        await this.device.Next()
      })
    this.actions
      .create("previous")
      .describe("previous track")
      .execute(async props => {
        if (!props.value.toBoolean()) return
        await this.device.Previous()
      })
      
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

  static createIntegrationVariable(v: IntegrationVariableEntity, parent: IntegrationVariableManager) {
    return new SonosVariable(v, parent)
  }

  static getVariableSchema() {
    return z.object({})
  }

  static filterRecordsByType(attributes: Record<string, any>, types: string[]) {
    const result: Record<string, VariableDataTypes> = {}
    Object.keys(attributes).forEach(k => {
      if (!types.includes(typeof attributes[k])) return
      result[k] = attributes[k]
    })
    return result
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