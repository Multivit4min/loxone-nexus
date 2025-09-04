import {
  IntegrationVariable as IntegrationVariableEntity,
  LoxoneVariable as LoxoneVariableEntity,
  Link as LinkEntity
} from "@prisma/client"
import { RepositoryContainer, ServiceContainer } from "../container"
import { InstanceManager } from "../core/InstanceManager"
import { Link } from "./Link"
import { logger } from "../logger"
import { LinkError } from "./LinkError"
import { IntegrationVariable } from "../integration/variables/IntegrationVariable"
import { LoxoneVariableService } from "../loxone/variables/LoxoneVariableService"

export class LinkManager extends InstanceManager<LinkEntity, Link> {

  services!: ServiceContainer
  logger = logger.child({}, { msgPrefix: "[LinkManager] " })

  constructor(readonly repositories: RepositoryContainer) {
    super()
  }

  async init(services: ServiceContainer) {
    this.services = services
    await this.reload()
  }

  async reload() {
    const links = await this.repositories.linkRepository.findAll()
    this.collection.set(...(await Promise.all(
      links.map(async link => {
        const l = new Link(link, this)
        await l.reload()
        return l
      })
    )))
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

  async create({ integrationVariableId, loxoneVariableId }: Omit<LinkEntity, "id">) {
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

  async remove(id: string) {
    const [link] = this.collection.removeBy("id", id)
    await this.repositories.linkRepository.remove(id)
    link.reloadReceiverEmitter()
    return link
  }

  async getVariables(intVarId: string, loxVarId: string): Promise<{
    integrationVariable: IntegrationVariableEntity,
    loxoneVariable: LoxoneVariableEntity
  }> {
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