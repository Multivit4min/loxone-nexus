import { IntegrationVariable as VariableEntity } from "@prisma/client"
import { IntegrationVariable } from "../../variables/IntegrationVariable"
import { IntegrationVariableManager } from "../../variables/IntegrationVariableManager"
import { SonosIntegration } from "./SonosIntegration"
import z from "zod"
import { UpdateProps } from "../../IntegrationEntry"

export class SonosVariable extends IntegrationVariable<
  z.infer<ReturnType<typeof SonosIntegration.getVariableSchema>>
> {

  constructor(entity: VariableEntity, parent: IntegrationVariableManager) {
    super(entity, parent)
  }

  get logger() {
    return this.instance.logger
  }

  get instance() {
    const instance = this.parent.parent
    if (instance instanceof SonosIntegration) return instance
    throw new Error(`received invalid parent instance`)
  }

  async reload() {
    await this.stop()
    const entity = await this.repositories.integrationVariable.findById(this.id)
    if (!entity) throw new Error(`could not find entity with id ${this.id}`)
    this.entity = entity
    await this.start()
    return this
  }

  async update({ label, config }: UpdateProps) {
    this.entity.label = label
    this.entity.config = config
    await this.repositories.integrationVariable.update(this.id, this.entity)
    this.services.socketManager.sendIntegrationVariable(this)
  }

  async sendValue() {
    if (this.value.value === null) return
    try {
      switch (this.config.action) {
        case "volume": return await this.setVolume()
        case "notification": return await this.executeNotification()
        case "next": return await this.next()
        case "previous": return await this.previous()
        case "play": return await this.play()
        case "pause": return await this.pause()
        default:
          this.logger.warn(`action ${(<any>this.config).action } is not implemented`)
      }
    } catch (e) {
      this.logger.error(e, `failed to execute sonos action ${this.config.action}`)
    }
  }

  async next() {
    if (this.config.action !== "next") return //type guard
    const { type, value } = this.value
    if (type !== "boolean") return this.logger.warn("Sonos next is only available for digital inputs")
    if (!value) return
    await this.instance.device.Next()
  }

  async previous() {
    if (this.config.action !== "previous") return //type guard
    const { type, value } = this.value
    if (type !== "boolean") return this.logger.warn("Sonos previous is only available for digital inputs")
    if (!value) return
    await this.instance.device.Previous()
  }

  async setVolume() {
    if (this.config.action !== "volume") return //type guard
    const { type, value } = this.value
    if (type !== "number") return this.logger.warn("Sonos set Volume is only available for analog inputs")
    await this.instance.device.SetVolume(value)
  }

  async pause() {
    if (this.config.action !== "pause") return //type guard
    const { type, value } = this.value
    if (type !== "boolean") return this.logger.warn("Sonos pause is only available for digital inputs")
    if (!value) return
    await this.instance.device.Pause()
  }

  async play() {
    if (this.config.action !== "play") return //type guard
    const { type, value } = this.value
    if (type !== "boolean") return this.logger.warn("Sonos play is only available for digital inputs")
    if (!value) return
    await this.instance.device.Play()
  }

  async executeNotification() {
    if (this.config.action !== "notification") return //type guard
    const { type, value } = this.value
    if (value === null) return
    if (type !== "string" && !this.config.uri) return this.logger.warn("Sonos Notification only available for string if no uri has been given")
    if ((type === "boolean" && !value) || (type === "string" && value.length === 0)) return
    const trackUri = this.config.uri || value
    if (typeof trackUri !== "string" || trackUri.length === 0) return this.logger.warn({ trackUri }, `invalid trackUri received for sonos playback`)
    const volume = typeof this.config.volume ? this.config.volume : undefined
    await this.instance.device.PlayNotification({ trackUri,  volume })
  }

  async start() {}
  async stop() {}

}