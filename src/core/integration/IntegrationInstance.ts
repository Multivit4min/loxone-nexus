import { IntegrationManager } from "./IntegrationManager"
import z from "zod"
import { IntegrationVariableManager } from "./variables/IntegrationVariableManager"
import { logger } from "../../logger/pino"
import { Logger } from "pino"
import { Instance } from "../instance/Instance"
import { ActionBuilder } from "./io/ActionBuilder"
import { IntegrationEntity } from "../../drizzle/schema"
import { InputBuilder } from "./io/InputBuilder"
import express from "express"

export interface IntegrationConstructor<T extends IntegrationInstance<any>> {
  new (entity: IntegrationEntity, parent: IntegrationManager): T

  configSchema(): z.ZodObject
}

export abstract class IntegrationInstance<T extends object> extends Instance<IntegrationEntity> {

  actions = new ActionBuilder(this)
  inputs = new InputBuilder(this)
  variables: IntegrationVariableManager
  logger: Logger
  //router for /hook/:integrationId/*
  publicRouter = express.Router()
  //protected router for /api/integration/:integrationId/custom/*
  authenticatedRouter = express.Router()

  constructor(entity: IntegrationEntity, parent: IntegrationManager) {
    super(entity, parent)
    this.variables = new IntegrationVariableManager(this)
    this.logger = logger.child({ id: this.entity.id }, { msgPrefix: `[Integration:${entity.type}:${entity.id}] ` })
  }

  private get ctor() {
    return this.constructor as IntegrationConstructor<this>
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
    if (config === null || typeof config !== "object")
      throw new Error(`invalid config in ${this.entity.id}`)
    return config as T
  }

  async update(data: Partial<UpdateProps>) {
    this.entity.label = data.label || this.entity.label
    this.entity.config = data.config || this.entity.config
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

  /**
   * updates store data without reloading the entity
   * @param store 
   */
  async updateStore(store: Record<string, any>) {    
    this.entity = await this.repositories.integration.update({
      id: this.id,
      store
    }) as any
    this.services.socketManager.sendIntegration(this)
  }

  /**
   * retrieves a stored key
   * this can be used to save persistent data
   * @param key the key to retrieve
   * @param fallback fallback data to initialize
   * @returns 
   */
  getStoreProperty<T extends any>(key: string, fallback?: T): T {
    if (!this.entity.store[key]) this.entity.store[key] = fallback
    return this.entity.store[key]
  }

  /**
   * sets the store key to the specified value
   * this can be used to save persistent data
   * @param key the key to store data to
   * @param value the value to save
   * @returns 
   */
  async setStoreProperty<T extends any>(key: string, value: T): Promise<T> {
    this.entity.store[key] = value
    await this.updateStore(this.entity.store)
    return this.entity.store[key]
  }

  serialize() {
    return {
      specific: this.specificSerialize(),
      variables: this.variables.serialize().entries,
      configSchema: z.toJSONSchema(this.ctor.configSchema()),
      outputVariableSchema: z.toJSONSchema(this.actions.schema),
      inputVariableSchema: z.toJSONSchema(this.inputs.schema),
      actions: this.actions.serialize(),
      ...this.entity
    }
  }

  abstract initialize(): Promise<any>
  abstract tree(): Promise<any[]>
  abstract specificSerialize(): any
  abstract start(): Promise<any>
  abstract stop(): Promise<any>

}

export type UpdateProps = {
  label: string
  config: object
}

