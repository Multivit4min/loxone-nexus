import { InstanceManager } from "../../instance/InstanceManager"
import { IntegrationConstructor, IntegrationInstance } from "../IntegrationInstance"
import { IntegrationVariable } from "./IntegrationVariable"
import { type IntegrationVariable as VariableEntity } from "@prisma/client"

export class IntegrationVariableManager extends InstanceManager<VariableEntity, IntegrationVariable> {

  constructor(public parent: IntegrationInstance<any>, readonly varConstructor: IntegrationConstructor) {
    super()
  }

  get actions() {
    return this.parent.actions
  }

  get logger() {
    return this.parent.logger.child({ module: "IntegrationVariableManager" })
  }

  get services() {
    return this.parent.services
  }

  get repositories() {
    return this.parent.repositories
  }

  async init() {
    const entities = await this.repositories.integrationVariable.findByIntegrationId(this.parent.id)
    this.collection.set(...await Promise.all(entities.map(entity => this.createEntryFromEntity(entity))))
    this.logger.info("initialized")
  }


  async reload() {
    await Promise.all(this.collection.map(v => v.reload()))
    this.services.socketManager.sendIntegration(this.parent)
  }

  private async createEntryFromEntity(entity: VariableEntity) {
    const variable = this.varConstructor.createIntegrationVariable(entity, this)
    await variable.start()
    return variable
  }

  async create(props: Pick<VariableEntity, "config"|"direction"|"label">): Promise<IntegrationVariable> {
    const entity = await this.repositories.integrationVariable.create({
      integrationId: this.parent.id,
      label: props.label,
      direction: props.direction,
      config: props.config,
      version: 1,
      value: null,
    })
    const variable = this.varConstructor.createIntegrationVariable(entity, this)
    this.collection.push(variable)
    this.services.socketManager.sendIntegration(this.parent)
    return variable
  }

  async remove(id: string) {
    const variable = this.getId(id)
    await variable.stop()
    await this.repositories.integrationVariable.remove(variable.id)
    this.collection.removeBy("id", id)
    this.services.socketManager.sendIntegration(this.parent)
    return variable
  }

}