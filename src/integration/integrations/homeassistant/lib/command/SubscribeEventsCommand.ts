import { HaosCommander } from "../HaosCommander"
import { EventCommand } from "./events/EventCommand"
import { EventsEventHandler } from "./events/EventsEventHandler"

export class SubscribeEventsCommand extends EventCommand<SubscribeEventsCommand.Payload, EventsEventHandler> {

  readonly type = "subscribe_events"
  readonly eventHandler: EventsEventHandler

  constructor(parent: HaosCommander) {
    super(parent)
    this.eventHandler = new EventsEventHandler(this)
  }

}

export namespace SubscribeEventsCommand {

  export type Payload = {
    type: "subscribe_events"
    event_type?: "state_changed"
  }

}