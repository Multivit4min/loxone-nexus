import { HomeAssistantCommand } from "../commands/abstract/HomeAssistantCommand"
import { HomeAssistantUnsubscribeEventCommand } from "../commands/HomeAssistantUnsubscribeEventCommand"

export type HomeAssistantEventHandlerCallback<T> = (props: T) => void

export class HomeAssistantEventHandler<T = any> {

  callbacks: HomeAssistantEventHandlerCallback<T>[] = []
  unsubscribeCommand?: Promise<void>

  constructor(private readonly command: HomeAssistantCommand<any, HomeAssistantEventHandler<T>>) {

  }

  on(cb: HomeAssistantEventHandlerCallback<T>) {
    this.callbacks.push(cb)
  }

  async unsubscribe() {
    if (this.unsubscribeCommand) return this.unsubscribeCommand
    this.unsubscribeCommand = new Promise<void>(async fulfill => {
      if (this.command.id) {
        await new HomeAssistantUnsubscribeEventCommand(this.command.socket).send({
          subscription: this.command.id
        })
      }
      this.command.socket.spliceCommand(this.command)
      fulfill()
    })
  }
}