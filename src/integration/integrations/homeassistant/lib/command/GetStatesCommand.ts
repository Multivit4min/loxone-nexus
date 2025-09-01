import { HaosCommand } from "./HaosCommand"

export class GetStatesCommand extends HaosCommand<GetStatesCommand.Payload, GetStatesCommand.Response> {

  readonly type = "get_states"

  async handleResponse(
    res: Record<string, any>,
    resolve: (data?: any) => void,
    reject: (err: Error) => void
  ) {
    if (res.success) {
      resolve(res.result)
    } else {
      reject(new Error(res.error.message))
    }
  }

}

export namespace GetStatesCommand {

  export type Payload = {
    type: "get_states"
  }

  export type Response = State[]

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


}