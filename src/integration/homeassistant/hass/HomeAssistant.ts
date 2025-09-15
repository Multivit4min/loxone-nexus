import EventEmitter from "events"
import { HomeAssistantSocket } from "./HomeAssistantSocket"
import { Logger } from "pino"
import { HomeAssistantStatesCommand } from "./commands/HomeAssistantStateCommand"
import { HomeAssistantSubscribeEventsCommand } from "./commands/HomeAssistantSubscribeEventsCommand"
import { HomeAssistantTriggerCommand, TriggerProps } from "./commands/HomeAssistantTriggerCommand"
import { CallServiceProps, HomeAssistantCallServiceCommand } from "./commands/HomeAssistantCallServiceCommand"

export type HomeAssistantConfig = {
  readonly url: string
  readonly token: string
  readonly logger?: Logger
}

export class HomeAssistant extends EventEmitter {

  private socket: HomeAssistantSocket

  constructor(readonly config: HomeAssistantConfig) {
    super()
    this.socket = new HomeAssistantSocket(this)
  }

  get logger() {
    return this.config.logger
  }

  async connect() {
    await this.socket.connect()
    return this
  }

  disconnect() {
    return this.socket.disconnect()
  }

  stop() {
    this.socket.removeAllListeners()
    return this.disconnect()
  }

  getStates() {
    return new HomeAssistantStatesCommand(this.socket).send()
  }
  
  async getState(entityId: string) {
    const states = await this.getStates()
    const state = states.find(state => state.entity_id === entityId)
    if (!state) throw new Error(`state for entity ${entityId} not found`)
    return state
  }

  subscribeEvents() {
    return new HomeAssistantSubscribeEventsCommand(this.socket).send({
      event_type: "state_changed"
    })
  }

  subscribeTrigger(trigger: TriggerProps) {
    return new HomeAssistantTriggerCommand(this.socket).send({ trigger })
  }

  callService(options: CallServiceProps) {
    return new HomeAssistantCallServiceCommand(this.socket).send(options)
  }
}