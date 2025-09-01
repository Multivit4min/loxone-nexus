import { IntegrationVariable as VariableEntity } from "@prisma/client"
import { IntegrationVariable } from "../../variables/IntegrationVariable"
import { IntegrationVariableManager } from "../../variables/IntegrationVariableManager"
import { HomeAssistantIntegration } from "./HomeAssistantIntegration"
import { SubscribeTriggerCommand } from "./lib/command/SubscribeTriggerCommand"
import { HomeAssistant } from "./lib/HomeAssistant"
import { logger } from "../../../logger"

export class HomeAssistantVariable extends IntegrationVariable<HomeAssistantIntegration> {

  subscribeTriggerCommand?: SubscribeTriggerCommand = undefined

  constructor(e: VariableEntity, parent: IntegrationVariableManager<HomeAssistantIntegration>) {
    super(e, parent)
  }

  get ha() {
    return this.parent.parent.ha
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

  static parseValue(type: "string"|"number"|"boolean", value: string) {
    switch (type) {
      case "number":
        const num = parseFloat(value)
        return isNaN(num) ? 0 : num
      case "boolean": 
        return ["on", "true", "active", "ok", "1"].includes(value.toLowerCase())
      default: return String(value)
    }
  }

  async sendValue() {
    const action = this.parent.parent.haServices.findServiceAction(this.domain, this.config.key)
    if (!action) throw new Error(`action ${this.domain}.${this.config.key} not found on variable id ${this.id}`)
    return action.action({
      action,
      entityId: this.entityId,
      value: HomeAssistantVariable.parseValue(action.type, this.entity.value||""),
      domain: this.domain
    })
  }

  async start() {
    if (!this.ha) return this.subscribeTriggerCommand = undefined
    if (this.subscribeTriggerCommand) await this.subscribeTriggerCommand.unsubscribe()
    this.updateValue(await this.getCurrentValue())
    this.subscribeTriggerCommand = await this.ha.createTrigger(cmd => {
      const trigger = cmd.addStateTrigger().setEntityId(this.entityId)
      if (this.key !== "state") trigger.setAttribute(this.key)
      trigger.on(res => {
        if (!res.to_state) return
        this.updateValue(this.getValueFromState(res.to_state))
      })
      return trigger
    })
  }

  getValueFromState({ attributes, state }: HomeAssistant.StateResponse) {
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
    if (!this.ha) return this.subscribeTriggerCommand = undefined
    if (this.subscribeTriggerCommand) await this.subscribeTriggerCommand.unsubscribe()
    this.subscribeTriggerCommand = undefined
  }

}