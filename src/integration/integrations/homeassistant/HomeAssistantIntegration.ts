import z from "zod"
import { IntegrationEntry } from "../../IntegrationEntry"
import { HomeAssistant } from "./lib/HomeAssistant"
import { IntegrationVariable as VariableEntity, VariableDirection } from "@prisma/client"
import { CreateIntegrationVariableProps } from "../../../express/api/controllers/integration.controller"
import { HomeAssistantVariable } from "./HomeAssistantVariable"
import { IntegrationVariableManager } from "../../variables/IntegrationVariableManager"
import { HomeAssistantLoxoneServices } from "./HomeAssistantLoxoneServices"
import { VariableDataTypes } from "../../../types/general"

export class HomeAssistantIntegration extends IntegrationEntry<
  z.infer<ReturnType<typeof HomeAssistantIntegration.configSchema>>
> {

  ha?: HomeAssistant
  haServices = new HomeAssistantLoxoneServices(this)

  getConstructor() {
    return HomeAssistantIntegration
  }

  get services() {
    return this.parent.services
  }

  get container() {
    return this.parent.container
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
      this.ha.disconnect()
      this.ha.removeAllListeners()
      this.ha = undefined
      return true
    } catch (e) {
      this.logger.error(e, `error during stop`)
      return false
    }
  }

  async remove() {
    await this.stop()
  }

  protected async _reload() {
    await this.stop()
    const entity = await this.container.integration.findById(this.entity.id)
    if (!entity) throw new Error(`integration entity ${this.entity.id} not found`)
    this.entity = entity
    await this.start()
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

  async createVariable(
    props: CreateIntegrationVariableProps<ReturnType<typeof HomeAssistantIntegration.getVariableSchema>>
  ): Promise<HomeAssistantVariable> {
    if (props.type === "input") {
      return this.createInputVariable(props)
    } else if (props.type) {
      return this.createOutputVariable(props)
    } else {
      throw new Error(`invalid prop.type: ${props.type}`)
    }
  }

  async createInputVariable(
    props: CreateIntegrationVariableProps<ReturnType<typeof HomeAssistantIntegration.getVariableSchema>>
  ): Promise<HomeAssistantVariable> {
    const { entityId, key } = props.integration
    const input = await this.getStateByEntityId(entityId)
    if (!input) throw new Error(`entityId "${entityId}" not found`)
    if (input.values[key] === undefined) throw new Error(`key ${key} not found in ${entityId}`)
    const entity = await this.container.integrationVariable.create({
      integrationId: this.id,
      label: props.label,
      direction: VariableDirection.INPUT,
      version: 1,
      value: null,
      config: props.integration,
    })
    const variable = this.getConstructor().createIntegrationVariable(entity, this.variables)
    this.variables.add(variable)
    this.services.socketManager.sendIntegration(this)
    return variable
  }

  async createOutputVariable(
    props: CreateIntegrationVariableProps<ReturnType<typeof HomeAssistantIntegration.getVariableSchema>>
  ): Promise<HomeAssistantVariable> {
    const actions = this.haServices.getServiceActions()
    const { entityId, key } = props.integration
    const [domain] = entityId.split(".")
    if (!actions[domain]) throw new Error(`domain unknown: ${domain}`)
    if (!actions[domain].some(a => a.name === key)) throw new Error(`action unknown: ${key}`)
    if (!await this.getStateByEntityId(entityId)) throw new Error(`entityId "${entityId}" not found`)
    const entity = await this.container.integrationVariable.create({
      integrationId: this.id,
      label: props.label,
      direction: VariableDirection.OUTPUT,
      version: 1,
      value: null,
      config: { entityId, key, domain },
    })
    const variable = this.getConstructor().createIntegrationVariable(entity, this.variables)
    this.variables.add(variable)
    this.services.socketManager.sendIntegration(this)
    return variable
  }

  specificSerialize() {
    return null
  }

  static createIntegrationVariable(v: VariableEntity, parent: IntegrationVariableManager<any>) {
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