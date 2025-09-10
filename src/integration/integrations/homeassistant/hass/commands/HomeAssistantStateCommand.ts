import { HomeAssistantSocket } from "../HomeAssistantSocket"
import { HomeAssistantCommand } from "./abstract/HomeAssistantCommand"

export type StateResponse = State[]

  export type State = {
    entity_id: string
    state: string
    attributes: {
      friendly_name: string
      [key: string]: any
    }
    last_changed: string
    last_reported: string
    last_updated: string
    context: {
      id: string
      parent_id: any|null
      user_id: any|null
    }
  }

export class HomeAssistantStatesCommand extends HomeAssistantCommand<void, StateResponse> {

  constructor(socket: HomeAssistantSocket) {
    super({ type: "get_states", socket })
  }

  transformResult(res: StateResponse): StateResponse {
    return res
  }
}