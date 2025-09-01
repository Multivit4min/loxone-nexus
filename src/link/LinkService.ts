import { IntegrationVariable, LoxoneVariable } from "@prisma/client"
import { RepositoryContainer, ServiceContainer } from "../container"
import { LinkEntry } from "./LinkEntry"

export class LinkError extends Error {}

export class LinkService {

  services!: ServiceContainer

  links: LinkEntry[] = []

  constructor(readonly repositories: RepositoryContainer) {}

  async init(services: ServiceContainer) {
    this.services = services
    await this.reload()
  }

  async reload() {
    this.links = []
    const links = await this.repositories.linkRepository.findAll()
    this.links = await Promise.all(links.map(link => new LinkEntry(link, this).init()))
  }

  sendIntegrationInput(id: string, value: string) {
    this.links
      .filter(link => link.integrationVariableId === id)
      .forEach(link => link.receive(value))
  }

  sendLoxoneInput(id: string, value: string) {
    this.links
      .filter(link => link.loxoneVariableId === id)
      .forEach(link => link.receive(value))
  }

  async createLink(intVar: string, loxVar: string) {
    const { integrationVariable, loxoneVariable } = await this.getVariables(intVar, loxVar)
    const entity = await this.repositories.linkRepository.create({
      integrationVariableId: integrationVariable.id,
      loxoneVariableId: loxoneVariable.id
    })
    const entry = await new LinkEntry(entity, this).init()
    this.links.push(entry)
    await entry.loxoneVariable.manager.reload()
    await entry.integrationVariable.parent.reload()
    return entity
  }

  private findLinkIndex(
    integrationVariableId: string,
    loxoneVariableId: string
  ) {
    return this.links.findIndex(link => (
      link.integrationVariableId === integrationVariableId &&
      link.loxoneVariableId === loxoneVariableId
    ))
  }

  async removeLink(integrationVariable: string, loxoneVariable: string) {
    const index = this.findLinkIndex(integrationVariable, loxoneVariable)
    if (index < 0) return
    const [link] = this.links.splice(index, 1)
    await this.repositories.linkRepository.remove(integrationVariable, loxoneVariable)
    if (!link.valid) return
    const loxone = this.services.loxoneManager.findId(link.loxoneId!)
    if (loxone) loxone.variables.reload()
    const integration = this.services.integrationManager.findById(link.integrationId!)
    if (integration) integration.variables.reload()
  }

  async getVariables(intVarId: string, loxVarId: string): Promise<{ integrationVariable: IntegrationVariable, loxoneVariable: LoxoneVariable}> {
    const [integrationVariable, loxoneVariable] = await Promise.all([
      this.repositories.integrationVariable.findLinkableById(intVarId),
      this.repositories.variables.findLinkableById(loxVarId)
    ])
    if (!integrationVariable) throw new LinkError(`no linkable integration variable with id ${intVarId} found`)
    if (!loxoneVariable) throw new LinkError(`no linkable loxone variable with id ${loxVarId} found`)
    return { integrationVariable, loxoneVariable }
  }

  async getAvailableLoxoneInputs() {
    const inputs = await this.repositories.variables.getInputs()
    return inputs
  }

  async getAvailableLoxoneOutputs() {
    const outputs = await this.repositories.variables.getUnusedOutputs()
    return outputs
  }

}