export class CollectionItemNotUniqueError extends Error {
  constructor(key: string|number|symbol, value: any) {
    super(`an item with ${String(key)} ${value} already exists in collection`)
  }
}