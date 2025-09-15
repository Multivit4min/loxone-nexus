import { RepositoryContainer, ServiceContainer } from "../container"

export type EntityType = Record<string, any>

export interface GenericManager<Y extends EntityType, T extends GenericInstance<Y>> {

  readonly store: T[]

  services: ServiceContainer
  repositories: RepositoryContainer

  findById(id: string): T|undefined
  getId(id: string): T

  remove(id: string): Promise<T>
  create(props: Y): Promise<T>

  reload(): Promise<void>

  serialize(): any

}


export interface GenericInstance<T extends EntityType> {

  readonly entity: T
  get id(): string
  get parent(): GenericManager<T, GenericInstance<T>>

  reload(): Promise<void>

  update(props: Partial<T>): Promise<this>

  start(): Promise<any>
  stop(): Promise<any>

  serialize(): any

}