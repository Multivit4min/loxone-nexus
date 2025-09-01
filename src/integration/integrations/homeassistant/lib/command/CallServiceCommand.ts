import { HaosCommand } from "./HaosCommand"

export class CallServiceCommand extends HaosCommand<CallServiceCommand.Payload, CallServiceCommand.Response> {

  readonly type = "call_service"

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

export namespace CallServiceCommand {

  export type Payload = {
    type: "call_service"
    domain: string
    service: string
    service_data?: Record<string, any>
  }

  export type Response = {
    id: string
    parent_id: string|null
    user_id: string|null
  }


}