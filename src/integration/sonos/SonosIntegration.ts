import z from "zod"
import { IntegrationInstance } from "../../core/integration/IntegrationInstance"
import { VariableDataTypes } from "../../types/general"
import { IntegrationManager } from "../../core/integration/IntegrationManager"
import { SonosDevice } from "@svrooij/sonos/lib"
import { GetZoneInfoResponse } from "@svrooij/sonos/lib/services"
import { SonosState } from "@svrooij/sonos/lib/models/sonos-state"
import { IntegrationEntity } from "../../drizzle/schema"
import { TransportState } from "@svrooij/sonos/lib/models"
import { TreeBuilder } from "../../core/integration/tree/TreeBuilder"
import { InputTreeEndpoint } from "../../core/integration/tree/InputTreeEndpoint"
import { TreeCategory } from "../../core/integration/tree/TreeCategory"


export class SonosIntegration extends IntegrationInstance<
  z.infer<ReturnType<typeof SonosIntegration.configSchema>>
> {

  device: SonosDevice
  private pollInterval?: NodeJS.Timeout
  static POLL_INTERVAL = 4 * 1000
  private zone?: GetZoneInfoResponse
  private state?: SonosState

  constructor(entity: IntegrationEntity, parent: IntegrationManager) {
    super(entity, parent, SonosIntegration)
    this.device = new SonosDevice(this.config.address)
    this.inputs
      .create("media info")
      .schema({ type: z.enum(["title", "playing", "volume", "muted"]) })
      .currentValue(({ config }) => {
        if (config.type === "title") return this.title
        if (config.type === "playing") return this.playingState
        if (config.type === "volume") return this.volume
        if (config.type === "muted") return this.muted
      })
      .register(({ variable, getCurrentValue }) => {
        let previous: string = ""
        const interval = setInterval(async () => {
          const value = await getCurrentValue()
          if (previous === JSON.stringify(value)) return
          previous = JSON.stringify(value)
          await variable.updateValue(value.value)
        }, 1000)
        return () => clearInterval(interval)
    })
    this.actions
      .create("notification")
      .setLabel("Play Notification")
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
      .setLabel("Start Playback")
      .describe("starts playback")
      .execute(async props => {
        if (!props.value.toBoolean()) return
        await this.device.Play()
      })
    this.actions
      .create("pause")
      .setLabel("Pause Playback")
      .describe("pauses playback")
      .execute(async props => {
        if (!props.value.toBoolean()) return
        await this.device.Pause()
      })
    this.actions
      .create("volume")
      .setLabel("Set Volume")
      .describe("set volume (0 to 100%)")
      .execute(async props => {
        let volume = Math.round(props.value.toNumber())
        if (volume < 0) volume = 0
        if (volume > 100) volume = 100
        await this.device.SetVolume(volume)
      })
    this.actions
      .create("next")
      .setLabel("Play next Track")
      .describe("next track")
      .execute(async props => {
        if (!props.value.toBoolean()) return
        await this.device.Next()
      })
    this.actions
      .create("previous")
      .setLabel("Play previous Track")
      .describe("previous track")
      .execute(async props => {
        if (!props.value.toBoolean()) return
        await this.device.Previous()
      })
      
  }

  get title() {
    if (!this.state) return ""
    if (this.state.mediaInfo.CurrentURIMetaData === undefined) return ""
    if (this.state.mediaInfo.CurrentURIMetaData === null) return ""
    if (typeof this.state.mediaInfo.CurrentURIMetaData === "string") {
      return this.state.mediaInfo.CurrentURIMetaData
    } else if ("Title" in this.state.mediaInfo.CurrentURIMetaData) {
      return this.state.mediaInfo.CurrentURIMetaData.Title
    } else {
      return ""
    }
  }

  get playingState() {
    if (!this.state) return false
    return this.state.transportState === TransportState.Playing
  }

  get volume() {
    if (!this.state) return -1
    return this.state.volume
  }

  get muted() {
    if (!this.state) return false
    return this.state.muted
  }

  getConstructor() {
    return SonosIntegration
  }

  async start() {
    this.device = new SonosDevice(this.config.address)
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

  async tree() {
    const tree = new TreeBuilder()
    const input = tree.addInputCategory("status")
    this.addMediaInfo(input, "title", this.title)
    this.addMediaInfo(input, "playing", this.playingState)
    this.addMediaInfo(input, "volume", this.volume)
    this.addMediaInfo(input, "muted", this.muted)
    tree.addOutputCategory("action").addActions(this.actions)
    return tree.serialize()
  }

  addMediaInfo(cat: TreeCategory, type: string, value: any) {
    cat
      .add(InputTreeEndpoint, type)
      .setValue(value)
      .setConfig({ label: type, action: "media info", type })
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