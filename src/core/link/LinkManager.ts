import { RepositoryContainer, ServiceContainer } from "../../container"
import { InstanceManager } from "../instance/InstanceManager"
import { Link } from "./Link"
import { logger } from "../../logger/pino"
import { LinkError } from "./LinkError"
import { IntegrationVariable } from "../integration/variables/IntegrationVariable"
import { LoxoneVariableService } from "../../loxone/variables/LoxoneVariableService"
import { IAppService } from "../../types/appService"
import { IntegrationVariableEntity, LinkEntity, LoxoneVariableEntity } from "../../drizzle/schema"
import { CreateLinkProps } from "../../drizzle/repositories/LinkRepository"

export class LinkManager extends InstanceManager<LinkEntity, Link> implements IAppService {

  services!: ServiceContainer
  logger = logger.child({}, { msgPrefix: "[LinkManager] " })

  constructor(readonly repositories: RepositoryContainer) {
    super()
  }

  async init(services: ServiceContainer) {
    this.services = services
    await this.reload()
  }

  async stop() {}

  async reload() {
    const entities = await this.repositories.linkRepository.findAll()
    const links = await Promise.all(
      entities.map(link => new Link(link, this).reload())
    )
    this.collection.set(...links)
  }

  async reloadLoxoneInstance(id: number) {
    await Promise.all([
      this.collection
        .filter(link => link.entity.loxoneVariable.loxoneId === id)
        .map(link => link.reload())
    ])
  }

  sendIntegrationInput(variable: IntegrationVariable) {
    return Promise.all(
      this.collection
        .filterBy("integrationVariableId", variable.id)
        .map(link => link.sendToLoxone(variable))
    ).catch(e => {
      this.logger.warn(e, `failed to send variable to integration`)
    })
  }

  sendLoxoneInput(variable: LoxoneVariableService) {
    return Promise.all(
      this.collection
        .filterBy("loxoneVariableId", variable.id)
        .map(link => link.sendToIntegration(variable))
    ).catch(e => {
      this.logger.warn(e, `failed to send variable to loxone`)
    })
  }

  async create({ integrationVariableId, loxoneVariableId }: Omit<CreateLinkProps, "id">) {
    const { integrationVariable, loxoneVariable } = await this.getVariables(integrationVariableId, loxoneVariableId)
    const entity = await this.repositories.linkRepository.create({
      integrationVariableId: integrationVariable.id,
      loxoneVariableId: loxoneVariable.id
    })
    const link = new Link(entity, this)
    this.collection.push(link)
    await link.reload()
    return link
  }

  async remove(id: number) {
    const [link] = this.collection.removeBy("id", id)
    await this.repositories.linkRepository.remove(id)
    link.reloadReceiverEmitter()
    return link
  }

  async getVariables(intVarId: number, loxVarId: number): Promise<{
    integrationVariable: IntegrationVariableEntity,
    loxoneVariable: LoxoneVariableEntity
  }> {
    const [integrationVariable, loxoneVariable] = await Promise.all([
      this.repositories.integrationVariable.findLinkableById(intVarId),
      this.repositories.variables.findLinkableById(loxVarId)
    ])
    if (!integrationVariable) throw new LinkError(`no linkable integration variable with id ${intVarId} found`)
    if (!loxoneVariable) throw new LinkError(`no linkable loxone variable with id ${loxVarId} found`)
    if (
      (integrationVariable.direction === "OUTPUT" && integrationVariable.links.length > 0) ||
      (loxoneVariable.direction === "OUTPUT" && loxoneVariable.links.length > 0)
    ) {
      throw new LinkError(`Output is already linked`)
    }
    return { integrationVariable, loxoneVariable }
  }

  getAvailableLoxoneInputs() {
    return this.repositories.variables.getInputs()
  }

  getAvailableLoxoneOutputs() {
    return this.repositories.variables.getUnusedOutputs()
  }

}