import { Instance } from "../core/Instance"
import { Link as LinkEntity } from "@prisma/client"
import { TypeConversion } from "../util/TypeConversion"
import { IntegrationVariable } from "../integration/variables/IntegrationVariable"
import { LoxoneVariableService } from "../loxone/variables/LoxoneVariableService"

export class Link extends Instance<LinkEntity> {

  private _loxoneVariable?: Promise<LoxoneVariableService>
  private _integrationVariable?: Promise<IntegrationVariable>

  get logger() {
    return this.parent.logger
  }

  get loxoneVariable() {
    if (this._loxoneVariable) return this._loxoneVariable
    this._loxoneVariable = new Promise(async resolve => {
      const entity = await this.parent.repositories.variables.findById(this.entity.loxoneVariableId)
      if (!entity) throw new Error(`loxone instance for link ${this.id} not found`)
      return resolve(this.parent.services.loxoneManager
        .getId(entity.loxoneId).variables
        .getId(this.entity.loxoneVariableId))
    })
    return this._loxoneVariable
  }

  get integrationVariable() {
    if (this._integrationVariable) return this._integrationVariable
    this._integrationVariable = new Promise(async resolve => {
      const entity = await this.parent.repositories.integrationVariable.findById(this.entity.integrationVariableId)
      if (!entity) throw new Error(`loxone instance for link ${this.id} not found`)
      return resolve(this.parent.services.integrationManager
        .getId(entity.integrationId).variables
        .getId(this.entity.integrationVariableId))
    })
    return this._integrationVariable
  }

  async reloadReceiverEmitter() {
    await Promise.all([
      (await this.loxoneVariable).reload(),
      (await this.integrationVariable).reload()
    ])
  }

  async reload() {
    const entity = await this.parent.repositories.linkRepository.findById(this.id)
    if (!entity) throw new Error(`missing link entity with id ${this.id}`)
    this.entity = entity
    this.reloadReceiverEmitter()
    const [loxVar, intVar] = await Promise.all([this.loxoneVariable, this.integrationVariable])
    if (loxVar.isInput) this.sendToIntegration(loxVar)
    if (intVar.isInput) this.sendToLoxone(intVar)
  }

  async update() {
    throw new Error("not implemented")
  }

  async start() {}
  async stop() {}

  serialize(): Record<string, any> {
    return { ...this.entity }
  }

  async sendToLoxone(variable: IntegrationVariable) {
    if (variable.entity.value === null)
      return this.logger.warn(`integration variable ${variable.entity.label} is null`)
    const loxoneVariable = await this.loxoneVariable
    return loxoneVariable.updateValue(
      TypeConversion.parseLoxoneTypeFromString(loxoneVariable.type, variable.entity.value)
    )
  }

  async sendToIntegration(variable: LoxoneVariableService) {
    if (variable.entity.value === null)
      return this.logger.warn(`loxone variable ${variable.entity.label} is null`)
    const integrationVariable = await this.integrationVariable
    return integrationVariable.updateValue(variable.entity.value)
  }

}