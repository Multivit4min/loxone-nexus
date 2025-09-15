import { Integration } from "@prisma/client"
import { IntegrationConstructor, IntegrationInstance } from "./IntegrationInstance"
import { RepositoryContainer, ServiceContainer } from "../../container"
import z from "zod"
import { logger } from "../../logger/pino"
import { Logger } from "pino"
import { InstanceManager } from "../instance/InstanceManager"
import { CreateIntegrationProps } from "../../prisma/repositories/IntegrationRepository"
import { IAppService } from "../../types/appService"


export class IntegrationManager extends InstanceManager<Integration, IntegrationInstance<any>> implements IAppService {

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

  async stop() {
    await Promise.all(this.collection.map(integration => integration.stop()))
  }

  async reload() {
    await Promise.all(this.collection.map(integration => integration.reload()))
  }

  get mappedConstructors() {
    return Object.keys(this.registered)
      .map(key => {
        const constructor = this.getRegisteredConstructor(key)
        if (!constructor) return null
        return { key, constructor }
      })
      .filter(v => v !== null)
  }

  getCommonIntegrationSchema() {
    const options = this.mappedConstructors.map(c => {
      return (c.constructor.configSchema() as z.ZodObject<any>).extend({
        name: z.literal(c.key),
        label: z.string().min(1).describe("name to identify this integration")
      })
    })
    if (options.length === 0) throw new Error(`no registered integrations`)
    return z.discriminatedUnion("name", options as any)
  }

  getConfig() {
    return {
      commonSchema: z.toJSONSchema(this.getCommonIntegrationSchema()),
      integrations: this.mappedConstructors.map(({ key, constructor }) => ({
        name: key,
        config: z.toJSONSchema(constructor.configSchema())
      }))
    }
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
  async create(data: CreateIntegrationProps) {
    const entity = await this.repositories.integration.create(data)
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
