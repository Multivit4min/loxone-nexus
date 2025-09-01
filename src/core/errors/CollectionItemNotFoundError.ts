export class CollectionItemNotFoundError extends Error {
  constructor(key: string|number|symbol, value: string) {
    super(`could not find ${String(key)} with value ${value} in collection`)
  }
}