import z from "zod"
import { Action } from "./Action"
import { IntegrationVariable } from "../variables/IntegrationVariable"
import { IntegrationInstance } from "../IntegrationInstance"

export class ActionBuilder {

  actions: Record<string, Action> = {}

  constructor(readonly parent: IntegrationInstance<any>) {}
  
  get logger() {
    return this.parent.logger
  }

  /**
   * creates a new action and adds it to the internal store
   * @param id id of the action to create
   * @returns 
   */
  create(id: string) {
    if (this.actions[id]) throw new Error(`action with id ${id} already exists`)
    const action = new Action(id, this)
    this.actions[id] = action
    return action
  }

  get schema() {
    const [schema, ...schemas] = Object.values(this.actions).map(a => a.zodSchema)
    return z.discriminatedUnion("action", [schema, ...schemas])
  }

  execute(variable: IntegrationVariable) {
    const actionId = variable.config.action
    const action = this.actions[actionId]
    if (!action) return this.logger.warn({ value: variable.value, config: variable.config }, `Action "${actionId}" not found!`)
    return action.request(variable)
  }

  serialize() {
    return Object.values(this.actions).map(a => a.serialize())
  }
}