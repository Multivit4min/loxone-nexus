import { Instance } from "../instance/Instance"
import { TypeConversion } from "../conversion/TypeConversion"
import { IntegrationVariable } from "../integration/variables/IntegrationVariable"
import { LoxoneVariableService } from "../../loxone/variables/LoxoneVariableService"
import { LinkEntity } from "../../prisma/repositories/LinkRepository"
import { LinkManager } from "./LinkManager"

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

  reloadReceiverEmitter() {
    return Promise.all([
      this.loxoneVariable.reload(),
      this.integrationVariable.reload()
    ])
  }

  async reload() {
    const entity = await this.parent.repositories.linkRepository.findById(this.id)
    if (!entity) throw new Error(`missing link entity with id ${this.id}`)
    this.entity = entity
    const [loxVar, intVar] = await Promise.all([this.loxoneVariable, this.integrationVariable])
    if (loxVar.isInput) this.sendToIntegration(loxVar)
    if (intVar.isInput) this.sendToLoxone(intVar)
    await this.reloadReceiverEmitter()
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
    return this.loxoneVariable.updateValue(
      TypeConversion.parseLoxoneTypeFromString(this.loxoneVariable.type, String(variable.value.value))
    )
  }

  sendToIntegration(variable: LoxoneVariableService) {
    if (variable.entity.value === null)
      return this.logger.warn(`loxone variable ${variable.entity.label} is null`)
    this.integrationVariable.updateValue(variable.value.value)
  }

}