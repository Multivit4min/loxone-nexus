import { Action } from "./Action"
import { IntegrationVariable } from "../variables/IntegrationVariable"
import { Builder } from "./abstract/Builder"

export class ActionBuilder extends Builder<Action> {

  protected createEntry(id: string): Action<any, {}> {
    return new Action(id, this)
  }

  execute(variable: IntegrationVariable<any>) {
    const actionId = variable.config.action
    const action = this.entries[actionId]
    if (!action) return this.logger.warn({ value: variable.value, config: variable.config }, `Action "${actionId}" not found!`)
    return action.request(variable)
  }

}