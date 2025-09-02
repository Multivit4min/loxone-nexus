import { VariableDirection, IntegrationVariable as VariableEntity } from "@prisma/client"
import { IntegrationEntry } from "../IntegrationEntry"
import { IntegrationVariableManager } from "./IntegrationVariableManager"
import { VariableDataTypes } from "../../types/general"
import { Instance } from "../../core/Instance"

export abstract class IntegrationVariable extends Instance<VariableEntity> {

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
    return this.entity.config as any
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
    this.entity.value = JSON.stringify(value)
    await this.repositories.integrationVariable.update(this.entity.id, { value: this.entity.value})
    if (this.isInput) this.services.linkService.sendIntegrationInput(this.id, this.entity.value)
    if (this.isOutput) this.sendValue()
    this.services.socketManager.sendIntegrationVariable(this)
    return this
  }

  serialize() {
    return { ...this.entity }
  }

}

export interface IntegrationVariableConstructor {
  new (entity: VariableEntity, parent: IntegrationVariableManager): IntegrationEntry<any>

}