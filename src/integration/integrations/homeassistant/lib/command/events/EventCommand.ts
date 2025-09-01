import { HaosCommander } from "../../HaosCommander"
import { Handler } from "./Handler"
import { HaosCommand } from "../HaosCommand"
import { UnsubscribeCommand } from "../UnsubscribeCommand"

export abstract class EventCommand<
  P extends HaosCommand.BasePayload,
  T extends Handler<any>
> extends HaosCommand<P, T> {

  abstract readonly type: string
  protected abstract eventHandler: Handler<any>

  constructor(parent: HaosCommander) {
    super(parent, { keep: true })
  }

  async handleResponse(
    res: Record<string, any>,
    resolve: (data?: any) => void,
    reject: (err: Error) => void
  ) {
    if (res.success) {
      resolve(this.eventHandler)
    } else {
      reject(new Error(res.error.message))
    }
  }

  unsubscribe() {
    if (!this.id) throw new Error(`not yet subscribed`)
    return this.parent.createCommand(UnsubscribeCommand).send({ subscription: this.id })
  }

}