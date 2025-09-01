import EventEmitter from "events"
import { TriggerEvent } from "../../types/Triggers"


export abstract class Trigger<T extends {} = any> {

  abstract readonly platform: string
  private idx = -1
  private events = new EventEmitter()

  constructor(protected data: T) {
  }

  get index() {
    return this.idx
  }

  on(props: (props: TriggerEvent["variables"]["trigger"]) => void) {
    this.events.on("trigger", props)
  }

  private emit(props: TriggerEvent["variables"]["trigger"]) {
    this.events.emit("trigger", props)
  }

  update(data: Partial<T>) {
    this.data = {
      ...this.data,
      ...data
    }
    return this
  }

  get payload(): { platform: string } & T {
    return {
      platform: this.platform,
      ...this.data
    }
  }

}