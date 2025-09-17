import { CreateIntegrationVariableProps } from "../../../drizzle/repositories/IntegrationVariableRepository"
import { IntegrationVariableEntity } from "../../../drizzle/schema"
import { InstanceManager } from "../../instance/InstanceManager"
import { IntegrationConstructor, IntegrationInstance } from "../IntegrationInstance"
import { IntegrationVariable } from "./IntegrationVariable"

export class IntegrationVariableManager extends InstanceManager<IntegrationVariableEntity, IntegrationVariable> {

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
    this.collection.set(...await Promise.all(entities.map(entity => this.createEntryFromEntity(entity, false))))
    this.logger.info("initialized")
  }


  async reload() {
    await Promise.all(this.collection.map(v => v.reload()))
    this.services.socketManager.sendIntegration(this.parent)
  }

  private async createEntryFromEntity(entity: IntegrationVariableEntity, start = true) {
    const variable = new IntegrationVariable(entity, this)
    if (start) await variable.start()
    return variable
  }

  async create(props: Omit<CreateIntegrationVariableProps, "integrationId">): Promise<IntegrationVariable> {
    const entity = await this.repositories.integrationVariable.create({
      integrationId: this.parent.id,
      label: props.label,
      direction: props.direction,
      config: props.config
    })
    const variable = await this.createEntryFromEntity(entity)
    this.collection.push(variable)
    this.services.socketManager.sendIntegration(this.parent)
    return variable
  }

  async remove(id: number) {
    const variable = this.getId(id)
    await variable.stop()
    await this.repositories.integrationVariable.remove(variable.id)
    this.collection.removeBy("id", id)
    this.services.socketManager.sendIntegration(this.parent)
    this.services.linkService.receiveRemoveIntegrationVariable(variable)
    return variable
  }

}