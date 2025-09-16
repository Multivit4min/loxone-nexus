import z from "zod"
import { ILogger } from "../../../../types/ILogger"
import { Entry } from "./Entry"

export abstract class Builder<T extends Entry> {

  entries: Record<string, T> = {}

  constructor(readonly parent: ILogger) {}
  
  get logger() {
    return this.parent.logger
  }

  protected abstract createEntry(id: string): T

  /**
   * creates a new action and adds it to the internal store
   * @param id id of the action to create
   * @returns 
   */
  create(id: string) {
    if (this.entries[id]) throw new Error(`action with id ${id} already exists`)
    this.entries[id] = this.createEntry(id)
    return this.entries[id]
  }

  get schema() {
    const [schema, ...schemas] = Object.values(this.entries).map(e => e.zodSchema)
    return z.discriminatedUnion("action", [schema, ...schemas])
  }

  serialize() {
    return Object.values(this.entries).map(e => e.serialize())
  }
}