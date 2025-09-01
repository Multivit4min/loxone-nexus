import { Trigger } from "./Trigger"

export class StateTrigger extends Trigger<StateTriggerOptions> {

  readonly platform = "state"

  constructor() {
    super({
      entity_id: ""
    })
  }

  protected get triggerData() {
    return {}
  }

  setEntityId(entity_id: string) {
    return this.update({ entity_id })
  }

  setAttribute(attribute: string) {
    return this.update({ attribute })
  }

  setFromState(from?: string) {
    return this.update({ from })
  }

  setToState(to?: string) {
    return this.update({ to })
  }

}

export type StateTriggerOptions = {
  entity_id: string
  attribute?: string
  from?: any
  to?: any
}