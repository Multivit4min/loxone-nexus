import { IntegrationInstance } from "../IntegrationInstance"
import { IntegrationVariableManager } from "./IntegrationVariableManager"
import { VariableDataTypes } from "../../../types/general"
import { Instance } from "../../instance/Instance"
import { IntegrationVariableEntity } from "../../../drizzle/schema"
import { VariableConverter } from "../../conversion/VariableConverter"
import { SerializedDataType } from "../../conversion/SerializedDataType"

export abstract class IntegrationVariable<T extends object = any> extends Instance<IntegrationVariableEntity> {

  constructor(
    entity: IntegrationVariableEntity,
    readonly parent: IntegrationVariableManager
  ) {
    super(entity, parent)
  }

  abstract start(): Promise<void>
  abstract stop(): Promise<void>

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