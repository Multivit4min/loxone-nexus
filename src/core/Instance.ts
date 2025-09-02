import { Logger } from "pino"
import { InstanceManager } from "./InstanceManager"

export type EntityType = Record<string, any>

export abstract class Instance<T extends EntityType> {

  abstract logger: Logger

  constructor(
    public entity: T,
    readonly parent: InstanceManager<T, Instance<T>>
  ) {}

  get id() {
    return this.entity.id
  }

  abstract reload(entity?: T): Promise<void>
  abstract update(props: Partial<T>): Promise<void>
  abstract start(): Promise<any>
  abstract stop(): Promise<any>
  abstract serialize(): Record<string, any>

}