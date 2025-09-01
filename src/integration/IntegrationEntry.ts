import { Integration, IntegrationVariable as VariableEntity } from "@prisma/client"
import { IntegrationManager } from "./IntegrationManager"
import z from "zod"
import { CreateIntegrationVariableProps } from "../express/api/controllers/integration.controller"
import { IntegrationVariable } from "./variables/IntegrationVariable"
import { IntegrationVariableManager } from "./variables/IntegrationVariableManager"
import { logger } from "../logger"
import { Logger } from "pino"

export abstract class IntegrationEntry<T extends object> {

  variables: IntegrationVariableManager<any> = new IntegrationVariableManager(this)
  logger: Logger

  constructor(protected entity: Integration, readonly parent: IntegrationManager) {
    this.logger = logger.child({ id: this.entity.id }, { msgPrefix: "[Integration] " })
    this.variables.init()
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

  get services() {
    return this.parent.services
  }

  get container() {
    return this.parent.container
  }

  get config() {
    const { config } = this.entity
    if (config === null && typeof config !== "object")
      throw new Error(`invalid config in ${this.entity.id}`)
    return config as T
  }

  getVariableById(id: string) {
    return this.variables.findById(id)
  }

  async update(data: UpdateProps) {
    this.entity.label = data.label
    this.entity.config = data.config
    await this.reload()
    await this.updateEntity()
  }

  async reload() {
    this.logger.info("reloading integration")
    await this._reload()
    this.services.socketManager.sendIntegration(this)
  }

  private async updateEntity() {
    await this.container.integration.update(this.entity.id, this.entity)
    this.services.socketManager.sendIntegration(this)
  }

  serialize() {
    const constructor = this.getConstructor()
    return {
      id: this.id,
      common: this.entity,
      specific: this.specificSerialize(),
      variables: this.variables.serialize(),
      icon: constructor.icon(),
      config: z.toJSONSchema(constructor.configSchema())
    }
  }

  abstract getConstructor(): IntegrationConstructor
  abstract createVariable<Y extends z.ZodObject<any>>(props: CreateIntegrationVariableProps<Y>): Promise<IntegrationVariable<any>>
  abstract getInternalVariables(): Promise<any>
  abstract specificSerialize(): any
  abstract remove(): Promise<void>
  protected abstract _reload(): Promise<void>

}

export type UpdateProps = {
  label: string
  config: object
}


export interface IntegrationConstructor {
  new (entity: Integration, parent: IntegrationManager): IntegrationEntry<any>

  createIntegrationVariable(entity: VariableEntity, parent: IntegrationVariableManager<any>): IntegrationVariable<any>
  getVariableSchema(): z.Schema
  configSchema(): z.Schema
  icon(): string
}