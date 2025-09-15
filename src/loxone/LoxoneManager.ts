import { LoxoneInstance } from "./LoxoneInstance"
import { RepositoryContainer, ServiceContainer } from "../container"
import { logger } from "../logger/pino"
import { InstanceManager } from "../core/instance/InstanceManager"
import { IAppService } from "../types/appService"
import { LoxoneEntity } from "../drizzle/schema"
import { CreateLoxoneProps } from "../drizzle/repositories/LoxoneRepository"

export class LoxoneManager extends InstanceManager<LoxoneEntity, LoxoneInstance> implements IAppService {

  services!: ServiceContainer
  logger = logger.child({}, { msgPrefix: "[LoxoneManager] " })

  constructor(readonly repositories: RepositoryContainer) {
    super()
  }

  // load all data sources from the repository
  async init(services: ServiceContainer) {
    this.services = services
    const entities = await this.repositories.loxone.findAll()
    this.collection.set(...await Promise.all(entities.map(entity => this.createLoxoneEntry(entity))))
    this.logger.info("initialized")
  }

  async stop() {
    await Promise.all(this.collection.map(instance => instance.stop(false)))
  }

  /**
   * reloads all instances
   */
  async reload() {
    const instances = await this.repositories.loxone.findAll()
    await Promise.all(this.collection.map(instance => instance.reload(instances.find(i => i.id === instance.id))))
  }

  /**
   * creates a new loxone instance and initializes it
   * @param entity database entity
   * @returns 
   */
  private async createLoxoneEntry(entity: LoxoneEntity) : Promise<LoxoneInstance> {
    const instance = new LoxoneInstance(entity, this)
    await instance.init()
    return instance
  }

  /**
   * creates a new source entry from scratch
   * @param config configuration for the new source
   */
  async create(config: CreateLoxoneProps) {
    const entity = await this.repositories.loxone.create(config)
    const loxone = await this.createLoxoneEntry(entity)
    this.collection.push(loxone)
    this.services.socketManager.sendInstance(loxone)
    return loxone
  }

  /**
   * removes a source entry completely
   * @param id id of the source to remove
   */
  async remove(id: number) {
    const loxone = this.getId(id)
    this.collection.removeBy("id", id)
    await loxone.stop()
    await this.repositories.loxone.remove(id)
    this.services.socketManager.sendInstances()
    return loxone
  }

}