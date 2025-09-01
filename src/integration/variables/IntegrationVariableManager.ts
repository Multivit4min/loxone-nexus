import { IntegrationEntry } from "../IntegrationEntry"
import { IntegrationVariable } from "./IntegrationVariable"

export class IntegrationVariableManager<T extends IntegrationEntry<any>> {

  variables: IntegrationVariable<T>[] = []

  constructor(public parent: T) {}

  get services() {
    return this.parent.parent.services
  }

  get container() {
    return this.parent.parent.container
  }

  async init() {
    await this.reload()
  }

  async reload() {
    await Promise.all(this.variables.map(v => v.stop()))
    const vars = await this.container.integrationVariable.findByIntegrationId(this.parent.id)
    this.variables = vars.map(v => this.parent.getConstructor().createIntegrationVariable(v, this))
    await Promise.all(this.variables.map(v => v.start()))
    this.services.socketManager.sendIntegration(this.parent)
  }

  async add(variable: IntegrationVariable<T>) {
    this.variables.push(variable)
    await variable.start()
    this.services.socketManager.sendIntegration(this.parent)
    return this
  }

  findById(id: string) {
    return this.variables.find(v => v.id === id)
  }

  async remove(id: string) {
    const variable = this.findById(id)
    if (!variable) return
    await variable.stop()
    await this.container.integrationVariable.remove(variable.id)
    this.variables = this.variables.filter(v => v.id !== variable.id)
    this.services.socketManager.sendIntegration(this.parent)
    return
  }

  serialize() {
    return this.variables.map(v => v.serialize())
  }

}