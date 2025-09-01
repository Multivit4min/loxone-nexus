import { HaosWebsocket } from "./HaosWebsocket"
import EventEmitter from "events"
import { HaosCommander } from "./HaosCommander"
import { GetConfigCommand } from "./command/GetConfigCommand"
import { GetServicesCommand } from "./command/GetServicesCommand"
import { GetStatesCommand } from "./command/GetStatesCommand"
import { CallServiceCommand } from "./command/CallServiceCommand"
import { SubscribeEventsCommand } from "./command/SubscribeEventsCommand"
import { SubscribeTriggerCommand } from "./command/SubscribeTriggerCommand"


export class HomeAssistant extends EventEmitter {

  private socket: HaosWebsocket
  readonly commander: HaosCommander

  constructor(readonly props: HomeAssistant.Props) {
    super()
    this.socket = new HaosWebsocket({ ws: this.props.ws })
    this.commander = new HaosCommander(this.socket, this.props.token)
  }

  disconnect() {
    this.socket.disconnect()
    return this
  }

  connect() {
    this.socket.connect()
    return this
  }

  setLight(entityId: string, state: boolean|number) {
    const service = typeof state === "number" || state ? "turn_on" : "turn_off"
    return this.callService({
      domain: "light",
      service,
      service_data: {
        entity_id: entityId,
        brightness: typeof state === "number" ? state : undefined
      }
    })
  }

  setSwitch(entityId: string, state: boolean) {
    return this.callService({
      domain: "switch",
      service: state ? "turn_on" : "turn_off",
      service_data: {
        entity_id: entityId
      }
    })
  }

  
  getConfig() {
    return this.commander.createCommand(GetConfigCommand).send()
  }
  
  getServices() {
    return this.commander.createCommand(GetServicesCommand).send()
  }

  getStates() {
    return this.commander.createCommand(GetStatesCommand).send()
  }

  async getState(entityId: string) {
    const states = await this.commander.createCommand(GetStatesCommand).send()
    const state = states.find(s => s.entity_id === entityId)
    if (!state) throw new Error(`State for entity ${entityId} not found`)
    return state as HomeAssistant.StateResponse
  }

  callService(props: HomeAssistant.CallService): Promise<any> {
    return this.commander.createCommand(CallServiceCommand).send({
      domain: props.domain,
      service: props.service,
      service_data: props.service_data
    })
  }

  subscribeStates() {
    return this.commander.createCommand(SubscribeEventsCommand).send()
  }

  async createTrigger(cb: (cmd: SubscribeTriggerCommand) => void) {
    const trigger = this.commander.createCommand(SubscribeTriggerCommand)
    cb(trigger)
    await trigger.send()
    return trigger
  }
}

export namespace HomeAssistant {
  export type Props = {
    ws: string
    token: string
  }

  export type CallService = CallServiceLight|CallServiceSwitch|CallServiceRaw

  export type CallServiceRaw = {
    domain: string
    service: string
    service_data: Record<string, any>
  }

  export type CallServiceLight = {
    domain: "light"
    service: "turn_on"|"turn_off"
    service_data: {
      entity_id: string
      brightness?: number
    }
  }

  export type CallServiceSwitch = {
    domain: "switch"
    service: "turn_on"|"turn_off"
    service_data: {
      entity_id: string
    }
  }

  export type StateResponse = {
    entity_id: string
    state: string
    attributes: Record<string, string>
    last_changed: string
    last_reported: string
    last_updated: string
    context: Record<string, any>
  }
}