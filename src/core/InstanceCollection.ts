import { CollectionItemNotFoundError } from "./errors/CollectionItemNotFoundError"
import { CollectionItemNotUniqueError } from "./errors/CollectionItemNotUniqueError"
import { EntityType, Instance } from "./Instance"

export class InstanceCollection<Y extends EntityType, T extends Instance<Y>> {

  items: T[] = []

  constructor(private readonly props: CollectionProps<Y>) {

  }

  /** unique property key to identify the items */
  get key() {
    return this.props.uniqueKey
  }

  /** returns a new array of filtered items by the given key and value */
  filterBy<T extends keyof Y>(key: T, value: Y[T], inverse = false) {
    return this.items.filter(item => inverse ? item.entity[key] !== value : item.entity[key] === value)
  }

  /** tries to find an item by the given key and value */
  findBy<T extends keyof Y>(key: T, value: Y[T], inverse = false) {
    return this.items.find(item => inverse ? item.entity[key] !== value : item.entity[key] === value)
  }

  /** tries to find an item by the given key and value throws an error if not found */
  getBy<T extends keyof Y>(key: T, value: Y[T]) {
    const item = this.findBy(key, value)
    if (!item) throw new CollectionItemNotFoundError(key, value)
    return item
  }

  /** removes items with given key and property */
  removeBy<T extends keyof Y>(key: T, value: Y[T]) {
    const removed = this.filterBy(key, value)
    if (removed.length === 0) return removed
    this.items = this.filterBy(key, value, true)
    return removed
  }

  /** adds a new item to the collection, makes also sure that its unique */
  push(...items: T[]) {
    items.forEach(item => {
      if (this.findBy(this.key, item.entity[this.key])) 
        throw new CollectionItemNotUniqueError(this.key, item.entity[this.key])
      return this.items.push(item)
    })
  }

  /** removes an item from the collection */
  splice(start: number, deleteCount?: number) {
    return this.items.splice(start, deleteCount)
  }

  /** creates a new array by iterating over the existint items */
  map<E>(callback: (value: T, index: number, array: T[]) => E) {
    return this.items.map<E>(callback)
  }

  /** iterates over the items inside the collection */
  forEach(callback: (value: T, index: number, array: T[]) => void) {
    return this.items.forEach(callback)
  }

  /** replaces all items inside the store */
  set(...items: T[]) {
    this.items = []
    items.forEach(item => this.push(item))
    return this
  }

}

export type CollectionProps<Y extends EntityType> = {
  /** key property to uniquely identify an item */
  uniqueKey: keyof Y
}