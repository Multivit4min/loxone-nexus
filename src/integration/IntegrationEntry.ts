import { Integration, IntegrationVariable as VariableEntity } from "@prisma/client"
import { IntegrationManager } from "./IntegrationManager"
import z from "zod"
import { IntegrationVariable } from "./variables/IntegrationVariable"
import { IntegrationVariableManager } from "./variables/IntegrationVariableManager"
import { logger } from "../logger/pino"
import { Logger } from "pino"
import { Instance } from "../core/Instance"


export abstract class IntegrationEntry<T extends object> extends Instance<Integration> {

  variables: IntegrationVariableManager
  logger: Logger

  constructor(entity: Integration, parent: IntegrationManager, varConstructor: IntegrationConstructor) {
    super(entity, parent)
    this.variables = new IntegrationVariableManager(this, varConstructor)
    this.logger = logger.child({ id: this.entity.id }, { msgPrefix: "[Integration] " })
    this.variables.init()
  }

  get services() {
    return this.parent.services
  }

  get repositories() {
    return this.parent.repositories
  }

  get id() {
    return this.entity.id
  }

  get name() {
    return this.entity.name
  }

  get label() {
    return this.entity.label
  }

  get config() {
    const { config } = this.entity
    if (config === null && typeof config !== "object")
      throw new Error(`invalid config in ${this.entity.id}`)
    return config as T
  }

  async update(data: UpdateProps) {
    this.entity.label = data.label
    this.entity.config = data.config
    await this.updateEntity()
    await this.reload()
  }

  async reload() {
    this.logger.info("reloading integration")
    await this.stop()
    const entity = await this.repositories.integration.findById(this.entity.id)
    if (!entity) throw new Error(`integration entity ${this.entity.id} not found`)
    this.entity = entity
    await this.start()
    this.services.socketManager.sendIntegration(this)
    return this
  }

  private async updateEntity() {
    await this.repositories.integration.update(this.entity.id, this.entity)
    this.services.socketManager.sendIntegration(this)
  }

  serialize() {
    const constructor = this.getConstructor()
    return {
      specific: this.specificSerialize(),
      variables: this.variables.serialize(),
      icon: constructor.icon(),
      configSchema: z.toJSONSchema(constructor.configSchema()),
      variableSchema: z.toJSONSchema(constructor.getVariableSchema()),
      ...this.entity
    }
  }

  abstract getConstructor(): IntegrationConstructor
  abstract getInternalVariables(): Promise<any>
  abstract specificSerialize(): any
  abstract start(): Promise<any>
  abstract stop(): Promise<any>

}

export type UpdateProps = {
  label: string
  config: object
}


export interface IntegrationConstructor {
  new (entity: Integration, parent: IntegrationManager): IntegrationEntry<any>

  label(): string
  createIntegrationVariable(entity: VariableEntity, parent: IntegrationVariableManager): IntegrationVariable
  getVariableSchema(): z.Schema
  configSchema(): z.ZodObject
  icon(): string
}