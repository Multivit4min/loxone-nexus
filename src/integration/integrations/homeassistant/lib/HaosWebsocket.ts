import Websocket, { RawData } from "ws"
import { EventEmitter } from "events"
import { HaosCommand } from "./command/HaosCommand"
import { logger } from "../../../../logger"

export interface HaosWebsocket extends EventEmitter {
  on(eventName: "message", listener: (props: any) => void): this
  emit(eventName: "message", props: any): boolean
  on(eventName: "state", listener: (state: HaosWebsocket.State, oldState: HaosWebsocket.State) => void): this
  emit(eventName: "state", state: HaosWebsocket.State, oldState: HaosWebsocket.State): boolean
}

export class HaosWebsocket extends EventEmitter {

  ws!: Websocket
  private state = HaosWebsocket.State.DISCONNECTED
  private logger = logger.child({}, { msgPrefix: "[HaosWebsocket] " })

  constructor(readonly props: HaosWebsocket.Props) {
    super()
  }

  get connecting() {
    return this.state === HaosWebsocket.State.CONNECTING
  }

  get connected() {
    return this.state === HaosWebsocket.State.CONNECTED
  }

  get disconnecting() {
    return this.state === HaosWebsocket.State.DISCONNECTING
  }

  get disconnected() {
    return this.state === HaosWebsocket.State.DISCONNECTED
  }


  sendCommand(cmd: HaosCommand) {
    cmd.state = HaosCommand.State.PENDING
    this.ws.send(JSON.stringify(cmd.content))
  }

  private setState(state: HaosWebsocket.State) {
    if (this.state === state) return state
    const old = this.state
    this.state = state
    this.logger.debug(`state changed ${HaosWebsocket.State[old]} > ${HaosWebsocket.State[state]}`)
    this.emit("state", state, old)
    return old
  }

  inState(...state: HaosWebsocket.State[]) {
    return state.includes(this.state)
  }

  connect() {
    return new Promise<void>(fulfill => {
      this.setState(HaosWebsocket.State.CONNECTING)
      this.ws = new Websocket(`${this.props.ws}/api/websocket`)
      this.ws.on("open", () => {
        this.handleOpen()
        fulfill()
      })
      this.ws.on("close", () => this.handleClose())
      this.ws.on("error", msg => this.handleClose(msg))
      this.ws.on("message", msg => this.handleMessage(msg))
    })
  }

  disconnect() {
    this.setState(HaosWebsocket.State.DISCONNECTING)
    this.ws.close()
  }

  private async handleClose(msg?: string|Error) {
    if (msg) this.logger.debug(msg, `websocket handle close`)
    if (!this.ws.CLOSED || !this.ws.CLOSING) this.ws.close()
    this.ws.removeAllListeners()
    if (!this.disconnected && !this.disconnecting) {
      this.setState(HaosWebsocket.State.CONNECTING)
      await HaosWebsocket.sleep(500)
      if (this.disconnecting || this.disconnected) return //maybe during sleep time socket requests a disconnect
      this.connect()
    } else {
      this.setState(HaosWebsocket.State.DISCONNECTED)
    }
  }

  private async handleOpen() {
    this.setState(HaosWebsocket.State.CONNECTED)
  }

  private handleMessage(msg: RawData) {
    const message = JSON.parse(msg.toString("utf8"))
    this.emit("message", message)
  }

  static sleep(time: number) {
    return new Promise<void>(resolve => {
      setTimeout(() => resolve(), time)
    })
  }

}

export namespace HaosWebsocket {

  export type Props = {
    ws: string
  }

  export enum State {
    DISCONNECTING,
    DISCONNECTED,
    CONNECTING,
    CONNECTED
  }


}