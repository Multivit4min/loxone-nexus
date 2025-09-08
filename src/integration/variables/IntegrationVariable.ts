import { VariableDirection, IntegrationVariable as VariableEntity } from "@prisma/client"
import { IntegrationEntry } from "../IntegrationEntry"
import { IntegrationVariableManager } from "./IntegrationVariableManager"
import { VariableDataTypes } from "../../types/general"
import { Instance } from "../../core/Instance"
import { TypeConversion } from "../../util/TypeConversion"

export abstract class IntegrationVariable<T extends object = any> extends Instance<VariableEntity> {

  constructor(
    entity: VariableEntity,
    readonly parent: IntegrationVariableManager
  ) {
    super(entity, parent)
  }

  abstract sendValue(): Promise<void>
  abstract start(): Promise<void>
  abstract stop(): Promise<void>

  get config() {
    return this.entity.config as T
  }

  get value() {
    return TypeConversion.DeserializeDataType(this.entity.value)
  }
  
  /** true when the variable gets sent from loxone to node */
  get isInput() {
    return this.entity.direction === VariableDirection.INPUT
  }

  /** true when the variable gets sent from node to loxone */
  get isOutput() {
    return this.entity.direction === VariableDirection.OUTPUT
  }

  get services() {
    return this.parent.services
  }

  get repositories() {
    return this.parent.repositories
  }

  async updateValue(value: VariableDataTypes|null) {
    this.entity.value = TypeConversion.SerializeDataType(value)
    await this.repositories.integrationVariable.update(this.entity.id, { value: this.entity.value})
    if (this.isInput) this.services.linkService.sendIntegrationInput(this)
    if (this.isOutput) this.sendValue()
    this.services.socketManager.sendIntegrationVariable(this)
    return this
  }

  serialize() {
    return {
      ...this.entity,
      value: this.value.value
     }
  }

}

export interface IntegrationVariableConstructor {
  new (entity: VariableEntity, parent: IntegrationVariableManager): IntegrationEntry<any>

}