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
    this.logger = this.parent.logger.child({}, { msgPrefix: "[IntegrationVariable] " })
  }

  async update(props: Partial<UpdateIntegrationVariableProps>) {
    this.entity = await this.repositories.integrationVariable.update({
      ...props,
      id: this.id
    }) as any
    await this.reload()
  }

  async reload() {
    await this.stop()
    const entity = await this.repositories.integrationVariable.findById(this.id)
    this.logger.debug(entity, "reloading integration variable")
    if (!entity) throw new Error(`could not find entity with id ${this.id}`)
    this.entity = entity
    await this.start()
    return this
  }

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

  async stop() {
    if (this.isOutput) return
    if (!this.unregister) return
    try {
      await this.unregister()
    } catch (e) {
      this.logger.error(e, "failed to unregister handler")
    }
  }
  
  get config() {
    return this.entity.config as T
  }

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

  get services() {
    return this.parent.services
  }

  get repositories() {
    return this.parent.repositories
  }

  async updateValue(value: VariableDataTypes|null) {
    this.entity.value = VariableConverter.SerializeDataType(value)
    await this.repositories.integrationVariable.update({
      id: this.entity.id,
      value: this.entity.value
    })
    if (this.isInput) this.services.linkService.sendIntegrationInput(this)
    if (this.isOutput) this.sendValue()
    this.services.socketManager.sendIntegrationVariable(this)
    return this
  }

  async sendValue() {
    if ( this.value.value === null) return
    this.parent.actions.execute(this)
  }

  serialize() {
    return {
      ...this.entity,
      value: this.value.value
     }
  }

}

export interface IntegrationVariableConstructor {
  new (entity: IntegrationVariableEntity, parent: IntegrationVariableManager): IntegrationInstance<any>

}