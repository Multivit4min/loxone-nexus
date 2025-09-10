import { HomeAssistantSocket } from "../HomeAssistantSocket"
import { HomeAssistantCommand } from "./abstract/HomeAssistantCommand"

export type HomeAssistantUnsubscribeEventCommandProps = {
  subscription: number
}

export class HomeAssistantUnsubscribeEventCommand extends HomeAssistantCommand<HomeAssistantUnsubscribeEventCommandProps, void> {

  constructor(socket: HomeAssistantSocket) {
    super({
      type: "unsubscribe_events",
      socket
    })
  }

  transformResult(res: any) {
    return res
  }

}