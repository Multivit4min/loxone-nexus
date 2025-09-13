import { HomeAssistantSocket } from "../HomeAssistantSocket"
import { Context } from "../types/context"
import { EventResponse } from "../types/responses"
import { HomeAssistantEventCommand } from "./abstract/HomeAssistantEventCommand"
import { State } from "./HomeAssistantStateCommand"

export type TriggerProps = TriggerStateProps | TriggerTimeProps | TriggerEventProps

export type TriggerStateProps = {
  platform: "state"
  entity_id: string
  attribute?: string
  from?: string
  to?: string
}

export type TriggerTimeProps = {
  platform: "time"
  at: string
}

export type TriggerEventProps = {
  platform: "event"
  event_type: string
  event_data: Record<string, any>
}


export type TriggerEvent = StateTriggerEvent

export type TriggerContent = {
  id: string
  idx: number
  alias: string|null
  platform: "state"
  entity_id: string
  from_state: State
  to_state?: State
  for: any
  attribute: any
  description: string
}

export type StateTriggerEvent = {
  variables: {
    trigger: TriggerContent
    context: Context
  }
}


export class HomeAssistantTriggerCommand extends HomeAssistantEventCommand<
  { trigger: TriggerProps },
  TriggerContent
> {


  constructor(socket: HomeAssistantSocket) {
    super({ type: "subscribe_trigger", socket })
  }

  transformEventResult({ event }: EventResponse<any>): TriggerContent {
    return event.variables.trigger
  }

}