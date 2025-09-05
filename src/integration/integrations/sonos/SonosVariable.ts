import { IntegrationVariable as VariableEntity } from "@prisma/client"
import { IntegrationVariable } from "../../variables/IntegrationVariable"
import { IntegrationVariableManager } from "../../variables/IntegrationVariableManager"
import { SonosIntegration } from "./SonosIntegration"
import z from "zod"

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

  async update() {
    this.logger.trace("SonosVariable#update is not implemented")
  }

  async sendValue() {
    if (this.value.value === null) return
    try {
      switch (this.config.action) {
        case "tts": return await this.executeTTS()
        case "notification": return await this.executeNotification()
        default:
          this.logger.warn(`action ${(<any>this.config).action } is not implemented`)
      }
    } catch (e) {
      this.logger.error(e, `failed to execute sonos action ${this.config.action}`)
    }
  }

  async executeTTS() {
    const { type, value } = this.value
    if (type !== "string") return this.logger.warn("Sonos TTS only available for string if no uri has been given")
    if (value.length === 0) return
    await this.instance.device.PlayTTS({
      text: value,
      volume: this.config.volume
    })
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