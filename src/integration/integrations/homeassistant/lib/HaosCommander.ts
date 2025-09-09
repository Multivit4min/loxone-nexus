import { HaosWebsocket } from "./HaosWebsocket"
import { AuthCommand } from "./command/AuthCommand"
import { GetConfigCommand } from "./command/GetConfigCommand"
import { HaosCommand } from "./command/HaosCommand"
import { EventEmitter } from "events"
import { Response } from "./types/Response"
import { EventCommand } from "./command/events/EventCommand"
import { logger } from "../../../../logger/pino"

export interface HaosCommander extends EventEmitter {
  on(eventName: "state", listener: (state: HaosCommander.State, oldState: HaosCommander.State) => void): this
  emit(eventName: "state", state: HaosCommander.State, oldState: HaosCommander.State): boolean
}

export class HaosCommander extends EventEmitter {

  private id = 1
  private internalId = 1
  private commands: HaosCommand[] = []
  private state: HaosCommander.State = HaosCommander.State.WAITING_FOR_WS
  private logger = logger.child({}, { msgPrefix: "[HaosCommander] " })

  constructor(private ws: HaosWebsocket, readonly token: string) {
    super()
    this.ws.on("state", async state => {
      switch (state) {
        case HaosWebsocket.State.CONNECTED:
          try {
            await this.authenticate()
            this.setState(HaosCommander.State.WAITING_FOR_HA_READY)
            await this.checkHAReadyState()
            this.setState(HaosCommander.State.READY)
            this.commands.filter(cmd => cmd.inState(HaosCommand.State.REQUESTED)).forEach(cmd => this.ws.sendCommand(cmd))
          } catch (e) {
            this.logger.error(e, "failed post connection state")
            this.ws.disconnect()
          } finally {
            return
          }
        case HaosWebsocket.State.CONNECTING:
        case HaosWebsocket.State.DISCONNECTED:
          this.id = 1
          this.commands.filter(cmd => (
            cmd.inState(HaosCommand.State.PENDING) || //reset all which had been sent but not yet received back
            (!cmd.inState(HaosCommand.State.INIT) && cmd.keep) //reset all which are in state keep
          )).forEach(cmd => cmd.reset())
          this.setState(HaosCommander.State.WAITING_FOR_WS)
          return
      }
    })
    this.ws.on("message", this.receiveMessage.bind(this))
  }

  /**
   * requires a the specified state, if its not in the requested state it will throw an error
   * @param state state the commander should be in
   * @returns 
   */
  private assertState(state: HaosCommander.State) {
    if (this.state === state) return
    throw new Error(`assert state error wanted ${state} but got ${this.state}`)
  }

  /**
   * sends the authentication token
   */
  async authenticate() {
    this.assertState(HaosCommander.State.WAITING_FOR_WS)
    this.setState(HaosCommander.State.AUTHENTICATING)
    await this.createCommand(AuthCommand).send({ access_token: this.token })
  }

  private async checkHAReadyState(interval: number = 500) {
    while (true) {
      const { state } = await this.createCommand(GetConfigCommand).send()
      if (state === "RUNNING") return
      await HaosWebsocket.sleep(interval)
    }
  }


  private setState(state: HaosCommander.State) {
    if (this.state === state) return state
    const old = this.state
    this.state = state
    this.emit("state", state, old)
    return old
  }

  inState(...state: HaosCommander.State[]) {
    return state.includes(this.state)
  }

  get nextId() {
    return this.id++
  }

  get nextInternalId() {
    return this.internalId++
  }

  getById(id: number|string, state?: HaosCommand.State) {
    let cmd: HaosCommand|undefined
    let cmds = this.commands
    if (state) cmds = cmds.filter(cmd => cmd.state === state)
    cmd = cmds.find(
      typeof id === "string" ? 
        c => c.type === id : 
        c => c.id === id
    )
    if (!cmd) throw new Error(`command with id ${id} not found${state? `, state: ${HaosCommand.State[state]} (${state})` : ""}`)
    return cmd
  }

  sendCommand(cmd: HaosCommand) {
    this.commands.push(cmd)
    if (this.ws.disconnected) this.ws.connect()
    if (this.state >= cmd.minimumState) {
      this.ws.sendCommand(cmd)
    }
  }

  private removeByInternalId(id: number) {
    this.commands = this.commands.filter(cmd => cmd.internalId !== id)
  }

  private async receiveMessage(res: Response<any>) {
    if (res.type.startsWith("auth")) {
      if (res.type === "auth_required") return
      const cmd = this.getById("auth", HaosCommand.State.PENDING)
      cmd.setResponse(res)
      if (!cmd.keep) this.removeByInternalId(cmd.internalId)
    } else if (res.type === "result" && res.id) {
      const cmd = this.getById(res.id, HaosCommand.State.PENDING)
      cmd.setResponse(res)
      if (!cmd.keep) this.removeByInternalId(cmd.internalId)
    } else if (res.type === "event") {
      const cmd = this.getById(res.id, HaosCommand.State.RECEIVED_OK)
      if (!(cmd instanceof EventCommand))
        throw new Error(`expected SubscribeEventsCommand instance but received something else`)
      const found = cmd["eventHandler"]["receiveEvent"](res.event)
      if (!found) this.logger.debug(`received unknown event %o`, res.event)
    } else {
      this.logger.debug("received invalid response without correct type or id: %o", res)
    }
  }

  createCommand<T extends HaosCommand<any, any>>(Command: HaosCommander.Constructor<T>): T {
    const command = new Command(this)
    return command
  }

}

export namespace HaosCommander {

  export enum State {
    WAITING_FOR_WS = 0,
    AUTHENTICATING = 1,
    WAITING_FOR_HA_READY = 2,
    READY = 3
  }

  export type Constructor<T extends HaosCommand> = {
    new(parent: HaosCommander): T
  }

}