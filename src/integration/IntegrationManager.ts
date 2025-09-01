import { Integration } from "@prisma/client"
import { IntegrationConstructor, IntegrationEntry } from "./IntegrationEntry"
import { RepositoryContainer, ServiceContainer } from "../container"
import z from "zod"
import { logger } from "../logger"
import { Logger } from "pino"

export class IntegrationManager {

  registered: Record<string, IntegrationConstructor> = {}
  integrations: IntegrationEntry<any>[] = []
  logger: Logger

  services!: ServiceContainer

  constructor(readonly container: RepositoryContainer) {
    this.logger = logger.child({}, { msgPrefix: "[IntegrationManager] " })
  }

  // load all data integrations from the repository
  async init(services: ServiceContainer) {
    this.services = services
    const entities = await this.container.integration.findAll()
    await Promise.all(entities.map(async entity => {
      try {
        const entry = this.createEntryFromEntity(entity)
        this.integrations.push(entry)
        await entry.reload()
      } catch (e) {
        this.logger.error(`could not activate integration id ${entity.id} with name ${entity.name}`)
      }
    }))
    this.logger.info("initialized")
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
  private createEntryFromEntity(entity: Integration) {
    const constructorClass = this.getRegisteredConstructor(entity.name)
    if (!constructorClass) throw new Error(`Integration with name ${entity.name} not found`)
    return new constructorClass(entity, this)
  }

  /**
   * retrieves a constructor by its name
   */
  getRegisteredConstructor(name: string): IntegrationConstructor|undefined {
    return this.registered[name]
  }

  /**
   * finds a single data integration by its id
   * @param id the id of the data integration to find
   */
  findById(id: string) {
    return this.integrations.find(integration => integration.id === id)
  }

  /**
   * creates a new integration entry from scratch
   * @param config configuration for the new integration
   */
  async createIntegration(config: any) {
    const entity = await this.container.integration.create(config)
    const integration = this.createEntryFromEntity(entity)
    this.integrations.push(integration)
    await integration.reload()
    this.services.socketManager.sendIntegrations()
    return integration
  }

  /**
   * removes a integration entry completely
   * @param id id of the integration to remove
   */
  async removeIntegration(id: string) {
    const entity = await this.container.integration.remove(id)
    const integration = this.findById(entity.id)
    if (!integration) return entity
    await integration.remove()
    this.integrations = this.integrations.filter(i => i.id !== entity.id)
    this.services.socketManager.sendIntegrations()
    return entity
  }

  serialize() {
    return this.integrations.map(integration => integration.serialize())
  }

}
