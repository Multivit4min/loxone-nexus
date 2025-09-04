import { IntegrationVariable as VariableEntity } from "@prisma/client"
import { IntegrationVariable } from "../../variables/IntegrationVariable"
import { IntegrationVariableManager } from "../../variables/IntegrationVariableManager"
import { SubscribeTriggerCommand } from "./lib/command/SubscribeTriggerCommand"
import { HomeAssistant } from "./lib/HomeAssistant"
import { logger } from "../../../logger"
import { HomeAssistantIntegration } from "./HomeAssistantIntegration"
import { ActionType } from "./HomeAssistantLoxoneServices"
import { SmartActuatorSingleChannelType } from "../../../types/general"

export class HomeAssistantVariable extends IntegrationVariable {

  subscribeTriggerCommand?: SubscribeTriggerCommand = undefined

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
  }

  async update() {
    this.logger.trace("HomeAssistantVariable#update is not implemented")
  }

  static parseValue(type: "string", value: string): string
  static parseValue(type: "number", value: string): number
  static parseValue(type: "boolean", value: string): boolean
  static parseValue(type: "SmartActuatorSingleChannel", value: string): SmartActuatorSingleChannelType
  static parseValue(type: ActionType, value: string) {
    switch (type) {
      case "number":
        const num = parseFloat(value)
        return isNaN(num) ? 0 : num
      case "boolean": 
        return ["on", "true", "active", "ok", "1"].includes(value.toLowerCase())
      case "SmartActuatorSingleChannel":
        const sma = { channel: 0, fadeTime: 0 }
        try {
          const { channel, fadeTime } = JSON.parse(value)
          sma.channel = typeof channel === "number" ? channel * 2.55 : 0
          sma.fadeTime = typeof fadeTime === "number" ? fadeTime : 0
        } catch (e) {
          sma.channel = HomeAssistantVariable.parseValue("number", value)
        }
        return sma
      case "string":
      default: return String(value)
    }
  }

  async sendValue() {
    const action = this.instance.haServices.findServiceAction(this.domain, this.config.key)
    if (!action) throw new Error(`action ${this.domain}.${this.config.key} not found on variable id ${this.id}`)
    return action.action({
      action,
      entityId: this.entityId,
      //@ts-ignore
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
    const triggerCmd = this.subscribeTriggerCommand
    this.subscribeTriggerCommand = undefined
    if (triggerCmd) {
      try {
        await triggerCmd.unsubscribe()
      } catch (e) {
        this.logger.warn(e, `failed to unsubscribe from trigger command during stop command, skipping...`)
      }
    }
  }

}