import { IntegrationInstance } from "../IntegrationInstance"
import { IntegrationVariableManager } from "./IntegrationVariableManager"
import { VariableDataTypes } from "../../../types/general"
import { Instance } from "../../instance/Instance"
import { IntegrationVariableEntity } from "../../../drizzle/schema"
import { VariableConverter } from "../../conversion/VariableConverter"
import { SerializedDataType } from "../../conversion/SerializedDataType"
import { UnregisterCallback } from "../io/Input"
import { Logger } from "pino"
import { UpdateIntegrationVariableProps } from "../../../drizzle/repositories/IntegrationVariableRepository"

export class IntegrationVariable<T extends { action: string } = any> extends Instance<IntegrationVariableEntity> {

  private unregister?: UnregisterCallback
  logger: Logger

  constructor(
    entity: IntegrationVariableEntity,
    readonly parent: IntegrationVariableManager
  ) {
    super(entity, parent)
    this.logger = this.parent.parent.logger.child({}, { msgPrefix: "[IntegrationVariable] " })
  }

  /**
   * updates the whole variable entity
   * @param props partial entity data
   */
  async update(props: Partial<UpdateIntegrationVariableProps>) {
    this.entity = await this.repositories.integrationVariable.update({
      ...props,
      id: this.id
    }) as any
    await this.reload()
    this.services.socketManager.sendIntegrationVariable(this)
  }

  /**
   * reloads the variable by
   * - stopping it
   * - load new entity from database
   * - start again
   * - send data via socketmanager
   */
  async reload() {
    await this.stop()
    const entity = await this.repositories.integrationVariable.findById(this.id)
    this.logger.debug({ id: this.id }, "reloading integration variable")
    if (!entity) throw new Error(`could not find entity with id ${this.id}`)
    this.entity = entity
    await this.start()
    this.services.socketManager.sendIntegrationVariable(this)
    return this
  }

  /**
   * starts handling the variable
   * if its an output this does not do anything
   * if its an input this will register the input handler
   * @returns 
   */
  async start() {
    if (this.isOutput) return
    try {
      const input = this.parent.parent.inputs.entries[this.config.action]
      if (!input) return this.logger.warn(`no input found for ${this.config.action}`)
      this.unregister = await input.handleRegister(this)
    } catch (e) {
      this.logger.error(e, "failed to start variable handler")
    }
  }

  /**
   * stops the handling of the variable
   * if its an output this does not do anything
   * if its an input this will unregister from the input handler
   */
  async stop() {
    if (this.isOutput) return
    if (!this.unregister) return
    try {
      await this.unregister()
    } catch (e) {
      this.logger.error(e, "failed to unregister handler")
    }
  }
  
  /** retrieve variable configuration */
  get config() {
    return this.entity.config as T
  }

  /** retrieve variable value */
  get value(): SerializedDataType {
    return this.entity.value ? this.entity.value : { type: "null", value: null }
  }
  
  /** true when the variable gets sent from loxone to node */
  get isInput() {
    return this.entity.direction === "INPUT"
  }

  /** true when the variable gets sent from node to loxone */
  get isOutput() {
    return this.entity.direction === "OUTPUT"
  }

  /** retrieves the service container */
  get services() {
    return this.parent.services
  }

  /** retrieves the repository container */
  get repositories() {
    return this.parent.repositories
  }

  /**
   * updates the value of the entity
   * @param value new value to set
   * @returns 
   */
  async updateValue(value: VariableDataTypes|null) {
    this.entity.value = VariableConverter.SerializeDataType(value)
    await this.repositories.integrationVariable.update({
      id: this.entity.id,
      value: this.entity.value
    })
    if (this.isInput) this.services.linkService.sendIntegrationInput(this)
    if (this.isOutput && this.value.value !== null) this.parent.actions.execute(this)
    this.services.socketManager.sendIntegrationVariable(this)
    return this
  }

  /**
   * updates store data without reloading the entity
   * @param store 
   */
  async updateStore(store: Record<string, any>) {    
    this.entity = await this.repositories.integrationVariable.update({
      id: this.id,
      store
    }) as any
    this.services.socketManager.sendIntegrationVariable(this)
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

  /**
   * prepares data to be serialized with JSON.stringify()
   * @returns 
   */
  serialize() {
    return {
      ...this.entity,
      value: this.value
     }
  }

}

export interface IntegrationVariableConstructor {
  new (entity: IntegrationVariableEntity, parent: IntegrationVariableManager): IntegrationInstance<any>

}