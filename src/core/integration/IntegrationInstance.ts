import { IntegrationManager } from "./IntegrationManager"
import z from "zod"
import { IntegrationVariableManager } from "./variables/IntegrationVariableManager"
import { logger } from "../../logger/pino"
import { Logger } from "pino"
import { Instance } from "../instance/Instance"
import { ActionBuilder } from "./io/ActionBuilder"
import { IntegrationEntity } from "../../drizzle/schema"
import { InputBuilder } from "./io/InputBuilder"
import { TreeProps } from "./tree/tree"


export abstract class IntegrationInstance<T extends object> extends Instance<IntegrationEntity> {

  actions = new ActionBuilder(this)
  inputs = new InputBuilder(this)
  variables: IntegrationVariableManager
  logger: Logger

  constructor(entity: IntegrationEntity, parent: IntegrationManager, varConstructor: IntegrationConstructor) {
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

  get type() {
    return this.entity.type
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
    await this.repositories.integration.update(this.entity)
    this.services.socketManager.sendIntegration(this)
  }

  serialize() {
    const constructor = this.getConstructor()
    return {
      specific: this.specificSerialize(),
      variables: this.variables.serialize().entries,
      configSchema: z.toJSONSchema(constructor.configSchema()),
      outputVariableSchema: z.toJSONSchema(this.actions.schema),
      inputVariableSchema: z.toJSONSchema(this.inputs.schema),
      actions: this.actions.serialize(),
      ...this.entity
    }
  }

  abstract tree(): Promise<any[]>
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
  new (entity: IntegrationEntity, parent: IntegrationManager): IntegrationInstance<any>

  configSchema(): z.ZodObject
}