import { Logger } from "pino"
import { RepositoryContainer, ServiceContainer } from "../../container"
import { EntityType, Instance } from "./Instance"
import { InstanceCollection } from "./InstanceCollection"


export abstract class InstanceManager<Y extends EntityType, T extends Instance<Y>> {

  readonly collection = new InstanceCollection<Y, T>({ uniqueKey: "id" })

  abstract services: ServiceContainer
  abstract repositories: RepositoryContainer
  abstract logger: Logger

  /**
   * finds a single loxone instance by its id
   * @param id the id of the instance to find
   */
  findId(id: Y["id"]) {
    return this.collection.findBy("id", id)
  }

  /**
   * finds a single instance throws an error if nothing has been found
   * @param id the id of the instance to find
   */
  getId(id: Y["id"]) {
    return this.collection.getBy("id", id)
  }
  
  abstract init(services: ServiceContainer): Promise<void>
  abstract remove(id: number): Promise<T>
  abstract create(props: any): Promise<T>

  abstract reload(): Promise<void>

  /** serializes all instances */
  serialize() {
    return this.collection.map(item => item.serialize())
  }

}