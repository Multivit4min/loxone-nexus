import { HomeAssistantSocket } from "../HomeAssistantSocket"
import { HomeAssistantCommand } from "./abstract/HomeAssistantCommand"

export class HomeAssistantAuthCommand extends HomeAssistantCommand {

  constructor(socket: HomeAssistantSocket) {
    super({
      type: "auth",
      socket
    })
  }

  serialize() {
    return {
      type: "auth",
      access_token: this.socket.parent.config.token
    }
  }

  transformResult(res: any) {
    return res
  }

}