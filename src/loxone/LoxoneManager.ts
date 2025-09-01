import { Loxone } from "@prisma/client"
import { LoxoneInstance } from "./LoxoneInstance"
import { LoxoneConfig } from "../prisma/repositories/LoxoneRepository"
import { ListenPortFinder } from "./util/ListenPortFinder"
import { RepositoryContainer, ServiceContainer } from "../container"
import { logger } from "../logger"
import { InstanceManager } from "../core/InstanceManager"

export class LoxoneManager extends InstanceManager<Loxone, LoxoneInstance> {

  services!: ServiceContainer
  logger = logger.child({}, { msgPrefix: "[LoxoneManager] " })

  constructor(
    readonly repositories: RepositoryContainer,
    private readonly listenPortFinder: ListenPortFinder
  ) {
    super()
  }

  // load all data sources from the repository
  async init(services: ServiceContainer) {
    this.services = services
    const entities = await this.repositories.loxone.findAll()
    this.collection.set(...await Promise.all(entities.map(entity => this.createLoxoneEntry(entity))))
    this.logger.info("initialized")
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
  private async createLoxoneEntry(entity: Loxone) {
    const instance = new LoxoneInstance(entity, this)
    await instance.init()
    return instance
  }

  /**
   * creates a new source entry from scratch
   * @param config configuration for the new source
   */
  async create(config: Omit<LoxoneConfig, "listenPort">) {
    const entity = await this.repositories.loxone.create({
      ...config,
      listenPort: await this.listenPortFinder.getNextAvailablePort()
    })
    const loxone = await this.createLoxoneEntry(entity)
    this.collection.push(loxone)
    this.services.socketManager.sendInstance(loxone)
    return loxone
  }

  /**
   * removes a source entry completely
   * @param id id of the source to remove
   */
  async remove(id: string) {
    const loxone = this.getId(id)
    this.collection.removeBy("id", id)
    await loxone.stop()
    await this.repositories.loxone.remove(id)
    this.services.socketManager.sendInstances()
    return loxone
  }

}