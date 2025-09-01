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

  protected abstract reload(entity?: T): Promise<void>

  protected abstract update(props: Partial<T>): Promise<void>

  protected abstract start(): Promise<any>
  protected abstract stop(): Promise<any>

  abstract serialize(): Record<string, any>

}