import { EventEmitter } from "events"
import { EventCommand } from "./EventCommand"

export abstract class Handler<T> extends EventEmitter{

  constructor(readonly parent: EventCommand<any, any>) {
    super()
  }

  protected abstract receiveEvent(data: T): boolean

  unsubscribe() {
    return this.parent.unsubscribe()
  }

}

export namespace Handler {

  export enum Response {
    IGNORE
  }
} 