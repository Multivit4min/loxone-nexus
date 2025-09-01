import { TriggerEvent } from "../../types/Triggers"
import { EventCommand } from "./EventCommand"
import { Handler } from "./Handler"

export interface TriggerEventHandler extends Handler<TriggerEvent> {
  on(eventName: "trigger", listener: (props: TriggerEvent["variables"]["trigger"]) => void): this
  emit(eventName: "trigger", props: TriggerEvent["variables"]["trigger"]): boolean
}

export class TriggerEventHandler extends Handler<TriggerEvent> {

  constructor(parent: EventCommand<any, any>) {
    super(parent)
  }

  protected receiveEvent(data: TriggerEvent) {
    this.emit("trigger", data.variables.trigger)
    return true
  }

}