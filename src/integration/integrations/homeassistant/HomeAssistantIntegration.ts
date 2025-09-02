import z from "zod"
import { IntegrationEntry } from "../../IntegrationEntry"
import { HomeAssistant } from "./lib/HomeAssistant"
import { Integration, IntegrationVariable as VariableEntity } from "@prisma/client"
import { HomeAssistantVariable } from "./HomeAssistantVariable"
import { IntegrationVariableManager } from "../../variables/IntegrationVariableManager"
import { HomeAssistantLoxoneServices } from "./HomeAssistantLoxoneServices"
import { VariableDataTypes } from "../../../types/general"
import { IntegrationManager } from "../../IntegrationManager"

export class HomeAssistantIntegration extends IntegrationEntry<
  z.infer<ReturnType<typeof HomeAssistantIntegration.configSchema>>
> {

  ha?: HomeAssistant
  haServices = new HomeAssistantLoxoneServices(this)

  constructor(entity: Integration, parent: IntegrationManager) {
    super(entity, parent, HomeAssistantIntegration)
  }

  getConstructor() {
    return HomeAssistantIntegration
  }

  async start() {
    this.ha = new HomeAssistant({
      ws: this.config.ws,
      token: this.config.token
    }).connect()
    await this.variables.reload()
  }

  async stop() {
    if (!this.ha) return true
    try {
      await Promise.all(this.variables.collection.map(v => v.stop()))
      this.ha.disconnect()
      this.ha.removeAllListeners()
      this.ha = undefined
      return true
    } catch (e) {
      this.logger.error(e, `error during stop`)
      return false
    }
  }

  async getInternalVariables() {
    if (!this.ha) return []
    const states = await this.getStates()
    return { states, services: this.haServices.getServiceActions() }
  }

  async getStates(): Promise<{ entityId: string, namespace: string, id: string, values: Record<string, any> }[]> {
    if (!this.ha) return []
    const states = await this.ha.getStates()
    return states.map(state => {
      const [namespace, ...rest] = state.entity_id.split(".")
      if (namespace === undefined || rest.length === 0) return null
      return {
        entityId: state.entity_id,
        namespace,
        id: rest.join("."),
        values: {
          ...HomeAssistantIntegration.filterRecordsByType(state.attributes, ["string", "number", "boolean"]),
          state: state.state
        }
      }
    }).filter(res => res !== null)
  }

  async getStateByEntityId(id: string) {
    const states = await this.getStates()
    return states.find(i => i.entityId === id)
  }

  specificSerialize() {
    return null
  }

  static createIntegrationVariable(v: VariableEntity, parent: IntegrationVariableManager) {
    return new HomeAssistantVariable(v, parent)
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
    return "mdi-home-assistant"
  }

  static getVariableSchema() {
    return z.object({
      entityId: z.string().min(1),
      key: z.string().min(1)
    })
  }

  static configSchema() {
    return z.object({
      ws: z.url({ protocol: /^wss?$/ }).describe("Websocket URL to access HomeAssistant (wss://domain.tld)"),
      token: z.string().min(1).describe("HomeAssistant access token")
    })
  }
}

export type HomeAssistantDataSourceConfig = {
  ws: string
  token: string
}