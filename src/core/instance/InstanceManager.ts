import { Logger } from "pino"
import { RepositoryContainer, ServiceContainer } from "../../container"
import { EntityType, Instance } from "./Instance"
import { InstanceCollection } from "./InstanceCollection"

export interface ISerialize {
  additionalSerialize?(): Record<string, any>
  serialize(): Record<string, any>
}  

export abstract class InstanceManager<Y extends EntityType, T extends Instance<Y>> implements ISerialize {

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

  additionalSerialize?(): Record<string, any>

  /** serializes all instances */
  serialize() {
    let serialized: Record<string, any> = {
      entries: this.collection.map(item => item.serialize())
    }
    if (typeof this.additionalSerialize === "function") {
      serialized = { 
        ...this.additionalSerialize(),
        ...serialized
      }
    }
    return serialized
  }

}