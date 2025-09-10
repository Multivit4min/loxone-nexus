import { HomeAssistantSocket } from "../HomeAssistantSocket"
import { Context } from "../types/context"
import { EventResponse } from "../types/responses"
import { HomeAssistantEventCommand } from "./abstract/HomeAssistantEventCommand"
import { State } from "./HomeAssistantStateCommand"

export type SubscribeEventResponse = SubscribeStateChangedEventResponse

export type SubscribeStateChangedEventResponse = {
  event_type: "state_changed",
  data: {
    entity_id: string
    old_state: State
    new_state: State
    origin: string
    time_fired: string
    context: Context
  }
}

export type SubscribeEventProps = {
  event_type: "state_changed"
}

export class HomeAssistantSubscribeEventsCommand extends HomeAssistantEventCommand<
  SubscribeEventProps,
  SubscribeEventResponse["data"]
> {

  constructor(socket: HomeAssistantSocket) {
    super({
      type: "subscribe_events",
      socket
    })
  }

  transformEventResult({ event }: EventResponse<any>) {
    return event.data
  }

}