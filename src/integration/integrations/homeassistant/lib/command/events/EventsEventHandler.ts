import { EventEvents, StateChangedEventData } from "../../types/Events"
import { EventCommand } from "./EventCommand"
import { Handler } from "./Handler"

export interface EventsEventHandler extends Handler<EventEvents> {
  on(eventName: "state_changed", listener: (props: StateChangedEventData) => void): this
  emit(eventName: "state_changed", props: any): boolean
}

export class EventsEventHandler extends Handler<EventEvents>{

  protected baseTransformer = (props: any) => props
  private transformer: Record<string, EventsEventHandler.TransformResponse<EventEvents>> = {}

  constructor(parent: EventCommand<any, any>) {
    super(parent)
  }

  protected handleEvent(eventName: string, transform: EventsEventHandler.TransformResponse<EventEvents>) {
    this.transformer[eventName] = transform
    return this
  }

  protected receiveEvent(data: EventEvents) {
    const cb = this.transformer[data.event_type]
    if (!cb) return false
    const res = cb(data)
    if (res === Handler.Response.IGNORE) return true
    this.emit(data.event_type as any, res)
    return true
  }

}

export namespace EventsEventHandler {
  
  export type TransformResponse<T> = (props: T) => any

}