import { VariableDirection, IntegrationVariable as VariableEntity } from "@prisma/client"
import { IntegrationEntry } from "../IntegrationEntry"
import { IntegrationVariableManager } from "./IntegrationVariableManager"
import { VariableDataTypes } from "../../types/general"

export abstract class IntegrationVariable<T extends IntegrationEntry<any>> {

  constructor(
    readonly entity: VariableEntity,
    readonly parent: IntegrationVariableManager<T>
  ) {}

  abstract sendValue(): Promise<void>

  get id() {
    return this.entity.id
  }

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
    return this.parent.parent.parent.services
  }

  get container() {
    return this.parent.parent.parent.container
  }

  abstract start(): Promise<void>
  abstract stop(): Promise<void>

  async updateValue(value: VariableDataTypes|null) {
    this.entity.value = String(value)
    await this.container.integrationVariable.update(this.entity.id, this.entity)
    this.services.socketManager.sendIntegrationVariable(this)
    if (this.isInput) this.services.linkService.sendIntegrationInput(this.id, this.entity.value)
    if (this.isOutput) this.sendValue()
    return this
  }

  serialize() {
    return { ...this.entity }
  }

}

export interface IntegrationVariableConstructor {
  new (entity: VariableEntity, parent: IntegrationVariableManager<any>): IntegrationEntry<any>

}