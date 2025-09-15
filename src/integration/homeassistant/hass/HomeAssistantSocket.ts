import Websocket, { RawData } from "ws"
import { EventEmitter } from "events"
import { CommandState, HomeAssistantCommand } from "./commands/abstract/HomeAssistantCommand"
import { HomeAssistant } from "./HomeAssistant"
import { Responses } from "./types/responses"
import { HomeAssistantAuthCommand } from "./commands/HomeAssistantAuthCommand"
import { HomeAssistantEventCommand } from "./commands/abstract/HomeAssistantEventCommand"
import { HomeAssistantGetConfigCommand } from "./commands/HomeAssistantGetConfigCommand"


export enum SocketState {
  DISCONNECTING,
  DISCONNECTED,
  CONNECTING,
  AUTHENTICATING,
  CHECK_HASS_READY,
  CONNECTED
}

export type HomeAssistantSocketProps = {
    ws: string
  }

export interface HomeAssistantSocket extends EventEmitter {
  on(eventName: "state", listener: (state: SocketState, oldState: SocketState) => void): this
  emit(eventName: "state", state: SocketState, oldState: SocketState): boolean
}

export class HomeAssistantSocket extends EventEmitter {

  SLEEP_TIME = 1000
  commands: HomeAssistantCommand[] = []
  currentId: number = 0
  ws?: Websocket
  private state = SocketState.DISCONNECTED

  constructor(readonly parent: HomeAssistant) {
    super()
  }

  get nextId() {
    return ++this.currentId
  }

  get connecting() {
    return this.state === SocketState.CONNECTING
  }

  get authenticating() {
    return this.state === SocketState.AUTHENTICATING
  }

  get checkHassReady() {
    return this.state === SocketState.CHECK_HASS_READY
  }

  get connected() {
    return this.state === SocketState.CONNECTED
  }

  get disconnecting() {
    return this.state === SocketState.DISCONNECTING
  }

  get disconnected() {
    return this.state === SocketState.DISCONNECTED
  }

  send(cmd: HomeAssistantCommand<any, any>) {
    this.commands.push(cmd)
    cmd.state = CommandState.REQUESTED
    if (this.connected) this.executeCommand(cmd)
  }

  private executeCommand(cmd: HomeAssistantCommand) {
    if (!this.ws) throw new Error(`no websocket attached`)
    cmd.state = CommandState.PENDING
    const payload = cmd.serialize()
    this.ws.send(JSON.stringify(payload))
  }

  private setState(state: SocketState) {
    if (this.state === state) return state
    const old = this.state
    this.state = state
    this.parent.logger?.debug(`state changed ${SocketState[old]} > ${SocketState[state]}`)
    this.emit("state", state, old)
    return old
  }

  inState(...state: SocketState[]) {
    return state.includes(this.state)
  }

  connect() {
    return new Promise<void>((fulfill, reject) => {
      this.connectHandler()
      const stateListener = (state: SocketState, old: SocketState) => {
        if (this.connected || old > state) this.removeListener("state", stateListener)
        if (this.connected) return fulfill()
        if (old > state) return reject(new Error("could not connect"))
      }
      this.on("state", stateListener)
    })
  }

  private connectHandler() {
    this.setState(SocketState.CONNECTING)
    this.ws = new Websocket(`${this.parent.config.url}/api/websocket`)
    this.ws.on("open", () => this.handleOpen())
    this.ws.on("close", () => this.handleClose())
    this.ws.on("error", msg => this.handleClose(msg))
    this.ws.on("message", msg => this.handleMessage(msg))
  }

  disconnect() {
    this.setState(SocketState.DISCONNECTING)
    this.handleClose("Shutdown")
  }

  private async handleClose(msg?: string|Error) {
    if (!this.ws) return this.parent.logger?.debug(msg, `handleClose but no .ws attached`)
    this.parent.logger?.debug({ msg }, `handling websocket close`)
    this.ws.terminate()
    this.ws.removeAllListeners()
    this.commands.forEach(cmd => cmd.reset(CommandState.REQUESTED))
    if (!this.disconnected && !this.disconnecting) {
      this.setState(SocketState.CONNECTING)
      await HomeAssistantSocket.sleep(this.SLEEP_TIME)
      if (this.disconnecting || this.disconnected) return //maybe during sleep time socket requests a disconnect
      this.connectHandler()
    } else {
      this.setState(SocketState.DISCONNECTED)
    }
  }

  private async handleOpen() {
    this.setState(SocketState.AUTHENTICATING)
  }

  private handleMessage(msg: RawData) {
    const message: Responses = JSON.parse(msg.toString("utf8"))
    if (this.checkHassReady) {
      if (message.type !== "result" || !message.success) return
      if (message.result.state === "RUNNING") {
        this.setState(SocketState.CONNECTED)
        this.commands.forEach(cmd => this.executeCommand(cmd))
      } else {
        this.parent.logger?.debug({ state: message.result.state }, "Waiting for HomeAssistant to get ready...")
        HomeAssistantSocket.sleep(this.SLEEP_TIME).then(() => {
          this.executeCommand(new HomeAssistantGetConfigCommand(this))
        })
      }
    } else if (message.type === "auth_required") {
      this.setState(SocketState.AUTHENTICATING)
      this.executeCommand(new HomeAssistantAuthCommand(this))
    } else if (message.type === "auth_ok") {
      this.setState(SocketState.CHECK_HASS_READY)
      this.executeCommand(new HomeAssistantGetConfigCommand(this))
    } else if (message.type === "auth_invalid") {
      this.setState(SocketState.DISCONNECTING)
      this.handleClose(new Error("invalid access_token"))
    } else if (message.type === "result") {
      const index = this.commands.findIndex(cmd => cmd.id === message.id)
      if (index < 0) {
        this.parent.logger?.error(message, "received response with invalid id")
        return this.handleClose(new Error("received response with invalid id"))
      }
      const cmd = this.commands[index]
      if (!cmd.isSubscription) this.commands.splice(index, 1)
      cmd._setResult(message)
    } else if (message.type === "event") {
      const cmd = this.commands.find(cmd => cmd.id === message.id)
      if (!cmd) return this.parent.logger?.error(message, "received event but no id for the message has been found")
      if (!(cmd instanceof HomeAssistantEventCommand)) return this.parent.logger?.error(message, "received event for a non eventcommand")
      cmd.receiveEvent(message)
    } else {
      this.parent.logger?.warn(message, "unhandled response")
    }
  }

  spliceCommand(command: HomeAssistantCommand) {
    const index = this.commands.findIndex(cmd => cmd === command)
    if (index < 0) return undefined
    return this.commands.splice(index, 1)[0]
  }

  static sleep(time: number) {
    return new Promise<void>(resolve => {
      setTimeout(() => resolve(), time)
    })
  }

}

export namespace HomeAssistantSocket {




}