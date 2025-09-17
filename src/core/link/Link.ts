import { Instance } from "../instance/Instance"
import { IntegrationVariable } from "../integration/variables/IntegrationVariable"
import { LoxoneVariableService } from "../../loxone/variables/LoxoneVariableService"
import { LinkManager } from "./LinkManager"
import { LinkEntity } from "../../drizzle/schema"
import { VariableConverter } from "../conversion/VariableConverter"

export class Link extends Instance<LinkEntity> {

  private loxoneVariable: LoxoneVariableService
  private integrationVariable: IntegrationVariable

  get logger() {
    return this.parent.logger
  }

  constructor(entity: LinkEntity, parent: LinkManager) {
    super(entity, parent)
    this.loxoneVariable = this.parent.services.loxoneManager
      .getId(this.entity.loxoneVariable.loxoneId).variables
      .getId(this.entity.loxoneVariableId)
    this.integrationVariable = this.parent.services.integrationManager
      .getId(this.entity.integrationVariable.integrationId).variables
      .getId(this.entity.integrationVariableId)
  }

  reloadVariables() {
    return Promise.all([
      this.reloadLoxoneVariable(),
      this.reloadIntegrationVariable()
    ])
  }

  reloadLoxoneVariable() {
    return this.loxoneVariable.reload()
  }

  reloadIntegrationVariable() {
    return this.integrationVariable.reload()
  }

  async reload() {
    const entity = await this.parent.repositories.linkRepository.findById(this.id)
    if (!entity) throw new Error(`missing link entity with id ${this.id}`)
    this.entity = entity
    const [loxVar, intVar] = await Promise.all([this.loxoneVariable, this.integrationVariable])
    if (loxVar.isInput) this.sendToIntegration(loxVar)
    if (intVar.isInput) this.sendToLoxone(intVar)
    await this.reloadVariables()
    return this
  }

  async update() {
    throw new Error("not implemented")
  }

  async start() {
    throw new Error("not implemented")
  }

  async stop() {
    throw new Error("not implemented")
  }

  serialize(): Record<string, any> {
    return { ...this.entity }
  }

  sendToLoxone(variable: IntegrationVariable) {
    if (variable.entity.value === null)
      return this.logger.warn(`integration variable ${variable.entity.label} is null`)
    const converter = new VariableConverter(variable.entity.value)
    return this.loxoneVariable.updateValue(converter.toLoxoneType(this.loxoneVariable.type))
  }

  sendToIntegration(variable: LoxoneVariableService) {
    if (variable.entity.value === null)
      return this.logger.warn(`loxone variable ${variable.entity.label} is null`)
    this.integrationVariable.updateValue(variable.value)
  }

}