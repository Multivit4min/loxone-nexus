import { HaosCommand } from "./HaosCommand"

export class UnsubscribeCommand extends HaosCommand<UnsubscribeCommand.Payload, UnsubscribeCommand.Response> {

  readonly type = "unsubscribe_events"

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

export namespace UnsubscribeCommand {

  export type Payload = {
    type: "unsubscribe_events"
    subscription: number
  }

  export type Response = null


}