import { HomeAssistantEventHandler } from "../../events/HomeAssistantEventHandler"
import { HomeAssistantSocket } from "../../HomeAssistantSocket"
import { HomeAssistantCommand } from "./HomeAssistantCommand"
import { EventResponse } from "../../types/responses"

export type HomeAssistantEventCommandProps = {
  type: string
  socket: HomeAssistantSocket
}

export abstract class HomeAssistantEventCommand<P = void, T = any> extends HomeAssistantCommand<
  P,
  HomeAssistantEventHandler<T>
> {

  eventHandler = new HomeAssistantEventHandler<T>(this)

  constructor(props: HomeAssistantEventCommandProps) {
    super({
      type: props.type,
      socket: props.socket,
      subscription: true
    })
  }

  transformResult(res: any): HomeAssistantEventHandler<T> {
    return this.eventHandler
  }

  receiveEvent(event: EventResponse<any>) {
    const result = this.transformEventResult(event)
    this.eventHandler.callbacks.forEach(cb => cb(result))
  }

  abstract transformEventResult(event: EventResponse<any>): T

}