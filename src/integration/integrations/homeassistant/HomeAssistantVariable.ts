import { IntegrationVariable as VariableEntity } from "@prisma/client"
import { IntegrationVariable } from "../../variables/IntegrationVariable"
import { IntegrationVariableManager } from "../../variables/IntegrationVariableManager"
import { HomeAssistant } from "./hass/HomeAssistant"
import { logger } from "../../../logger/pino"
import { HomeAssistantIntegration } from "./HomeAssistantIntegration"
import { TypeConversion } from "../../../util/TypeConversion"
import { HomeAssistantEventHandler } from "./hass/events/HomeAssistantEventHandler"
import { State } from "./hass/commands/HomeAssistantStateCommand"

export class HomeAssistantVariable extends IntegrationVariable {

  triggerEventHandler?: HomeAssistantEventHandler = undefined

  constructor(entity: VariableEntity, parent: IntegrationVariableManager) {
    super(entity, parent)
  }

  get logger() {
    return this.instance.logger
  }

  get instance() {
    const instance = this.parent.parent
    if (instance instanceof HomeAssistantIntegration) return instance
    throw new Error(`received invalid parent instance`)
  }

  get ha() {
    return this.instance.ha
  }

  get entityId() {
    return this.config.entityId
  }

  get key() {
    return this.config.key
  }

  get domain() {
    const [domain] = this.entityId.split(".")
    return domain
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
    this.logger.trace("HomeAssistantVariable#update is not implemented")
  }

  async sendValue() {
    const action = this.instance.haServices.findServiceAction(this.domain, this.config.key)
    if (!action) throw new Error(`action ${this.domain}.${this.config.key} not found on variable id ${this.id}`)
    const { type, value } = TypeConversion.DeserializeDataType(this.entity.value)
    if (value === null) return
    if (type === "SmartActuatorSingleChannel") value.channel *= 2.55
    return action.action({
      action,
      entityId: this.entityId,
      value,
      domain: this.domain
    })
  }

  async start() {
    if (!this.ha) return this.triggerEventHandler = undefined
    if (this.triggerEventHandler) await this.triggerEventHandler.unsubscribe()
    this.updateValue(await this.getCurrentValue())
    this.triggerEventHandler = await this.ha.subscribeTrigger({
      platform: "state",
      entity_id: this.entityId,
      attribute: this.key !== "state" ? this.key : undefined
    })
    this.triggerEventHandler.on(res => {
      if (!res.to_state) return
      this.updateValue(this.getValueFromState(res.to_state))
    })
  }

  getValueFromState({ attributes, state }: State) {
    return this.key !== "state" ? attributes[this.key] : state
  }

  async getCurrentValue() {
    if (!this.ha) return null
    try {
      const state = await this.ha.getState(this.entityId)
      return this.getValueFromState(state)
    } catch (e: any) {
      logger.child({ id: this.id }, { msgPrefix: "[HomeAssistantVariable] " }).error(e.message)
      return null
    }
  }

  async stop() {
    if (!this.ha) return this.triggerEventHandler = undefined
    const triggerCmd = this.triggerEventHandler
    this.triggerEventHandler = undefined
    if (triggerCmd) {
      try {
        await triggerCmd.unsubscribe()
      } catch (e) {
        this.logger.warn(e, `failed to unsubscribe from trigger command during stop command, skipping...`)
      }
    }
  }

}