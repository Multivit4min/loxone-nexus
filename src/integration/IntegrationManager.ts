import { Integration } from "@prisma/client"
import { IntegrationConstructor, IntegrationEntry } from "./IntegrationEntry"
import { RepositoryContainer, ServiceContainer } from "../container"
import z from "zod"
import { logger } from "../logger"
import { Logger } from "pino"
import { InstanceManager } from "../core/InstanceManager"

export class IntegrationManager extends InstanceManager<Integration, IntegrationEntry<any>> {

  registered: Record<string, IntegrationConstructor> = {}
  logger: Logger

  services!: ServiceContainer

  constructor(readonly repositories: RepositoryContainer) {
    super()
    this.logger = logger.child({}, { msgPrefix: "[IntegrationManager] " })
  }

  // load all data integrations from the repository
  async init(services: ServiceContainer) {
    this.services = services
    const entities = await this.repositories.integration.findAll()
    this.collection.set(...await Promise.all(entities.map(entity => this.createEntryFromEntity(entity))))
    this.logger.info("initialized")
  }

  async reload() {
    await Promise.all(this.collection.map(integration => integration.reload()))
  }

  getConfig() {
    return Object.keys(this.registered).map(k => {
      const constructor = this.getRegisteredConstructor(k)
      if (!constructor) return null
      return {
        name: k,
        icon: constructor.icon(),
        config: z.toJSONSchema(constructor.configSchema())
      }
    })
  }

  /**
   * registers a new integration
   * @param name the unique name to identify the Integration
   * @param constructor the constructor class
   * @returns 
   */
  register(name: string, constructor: IntegrationConstructor) {
    this.registered[name] = constructor
    return this
  }

  /**
   * creates a new IntegrationEntry from a Integration entity
   * @param entity entity from database
   * @returns 
   */
  private async createEntryFromEntity(entity: Integration) {
    const constructorClass = this.getRegisteredConstructor(entity.name)
    if (!constructorClass) throw new Error(`Integration with name ${entity.name} not found`)
    const integration = new constructorClass(entity, this)
    await integration.start()
    await integration.variables.init()
    return integration
  }

  /**
   * retrieves a constructor by its name
   */
  getRegisteredConstructor(name: string): IntegrationConstructor|undefined {
    return this.registered[name]
  }

  /**
   * creates a new integration entry from scratch
   * @param config configuration for the new integration
   */
  async create(config: any) {
    const entity = await this.repositories.integration.create(config)
    const integration = await this.createEntryFromEntity(entity)
    this.collection.push(integration)
    this.services.socketManager.sendIntegrations()
    return integration
  }

  /**
   * removes a integration entry completely
   * @param id id of the integration to remove
   */
  async remove(id: string) {
    const entity = await this.repositories.integration.remove(id)
    const integration = this.getId(entity.id)
    await integration.stop()
    this.collection.removeBy("id", id)
    this.services.socketManager.sendIntegrations()
    return integration
  }

}
