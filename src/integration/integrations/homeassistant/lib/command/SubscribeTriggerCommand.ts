import { HaosCommander } from "../HaosCommander"
import { EventCommand } from "./events/EventCommand"
import { TriggerEventHandler } from "./events/TriggerEventHandler"
import { StateTrigger } from "./triggers/StateTrigger"
import { Trigger } from "./triggers/Trigger"

export class SubscribeTriggerCommand extends EventCommand<SubscribeTriggerCommand.Payload, TriggerEventHandler> {

  readonly type = "subscribe_trigger"
  readonly eventHandler: TriggerEventHandler
  readonly triggers: Trigger[] = []

  constructor(parent: HaosCommander) {
    super(parent)
    this.eventHandler = new TriggerEventHandler(this)
    this.eventHandler.on("trigger", ev => {
      const trigger = this.triggers[ev.idx]
      if (trigger) trigger["emit"](ev)
    })
  }

  prepareSend() {
    this.setContent({
      type: "subscribe_trigger",
      trigger: this.triggers.map((trigger, i) => {
        trigger["idx"] = i
        return trigger.payload
      })
    })
  }

  addTrigger(trigger: Trigger) {
    this.triggers.push(trigger)
    this.setContent({ type: this.type, trigger: this.triggers })
    return this
  }

  addStateTrigger() {
    const trigger = new StateTrigger()
    this.addTrigger(trigger)
    return trigger
  }

}

export namespace SubscribeTriggerCommand {

  export type Payload = {
    type: "subscribe_trigger"
    trigger: Trigger|Trigger[]
  }

}