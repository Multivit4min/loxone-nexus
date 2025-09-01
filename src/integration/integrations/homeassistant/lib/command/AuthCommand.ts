import { HaosCommander } from "../HaosCommander"
import { HaosCommand } from "./HaosCommand"

export class AuthCommand extends HaosCommand<AuthCommand.Payload, AuthCommand.Response> {
  
  readonly type = "auth"

  constructor(parent: HaosCommander) {
    super(parent, { noId: true, minHAState: HaosCommander.State.AUTHENTICATING })
  }

  async handleResponse(
    res: Record<string, any>,
    resolve: (data?: any) => void,
    reject: (err: Error) => void
  ) {
    if (res.type === "auth_ok") return resolve()
    reject(new Error(`received invalid response while authenticating ${res.type}`))
  }

}

export namespace AuthCommand {

  export type Payload = {
    type: "auth",
    access_token: string
  }

  export type Response = void

}