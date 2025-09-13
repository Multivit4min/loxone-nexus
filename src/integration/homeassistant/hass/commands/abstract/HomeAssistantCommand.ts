import { HomeAssistantSocket } from "../../HomeAssistantSocket"
import { CommandErrorResponse, CommandResponse } from "../../types/responses"

export enum CommandState {
  INIT,
  REQUESTED,
  PENDING,
  RECEIVED,
  RECEIVED_OK,
  RECEIVED_FAILED,
  RECEIVED_TIMEOUT
}

export type CommandProps = {
  socket: HomeAssistantSocket
  type: string
  //defines if the command gets removed after it has been received
  subscription?: boolean
}

export class HomeAssistantErrorResponse extends Error {
  readonly code: string
  constructor(response: CommandErrorResponse) {
    super(response.error.message)
    this.code = response.error.code
  }
}

export abstract class HomeAssistantCommand<P = void, T = any> {

  id?: number
  additionalProps?: P
  state = CommandState.INIT

  private fulfill?: (value: T) => void
  private reject?: (value: HomeAssistantErrorResponse|Error) => void

  constructor(readonly props: CommandProps) {

  }

  get socket() {
    return this.props.socket
  }

  get type() {
    return this.props.type
  }

  get isSubscription() {
    return !!this.props.subscription
  }

  send(props: P) {
    return new Promise<T>((fulfill, reject) => {
      if (this.state !== CommandState.INIT) return reject(new Error("command has already been requested"))
      this.additionalProps = props
      this.fulfill = fulfill
      this.reject = reject
      this.socket.send(this)
    })
  }

  _setResult(res: CommandResponse<T>) {
    if (this.state !== CommandState.PENDING) return this.socket.parent.logger?.error(res, `received result while in wrong state ${this.state}`)
    if (!this.reject || !this.fulfill) return this.socket.parent.logger?.error(res, "no promise resolvers attached")
    if (!res.success) {
      this.state = CommandState.RECEIVED_FAILED
      return this.reject(new HomeAssistantErrorResponse(res))
    }
    this.state = CommandState.RECEIVED_OK
    return this.fulfill(this.transformResult(res.result))
  }

  abstract transformResult(res: any): T

  reset(state: CommandState) {
    this.state = state
    this.id = undefined
  }

  serialize(): Record<string, any> {
    if (!this.id) this.id = this.socket.nextId
    return {
      id: this.id,
      type: this.type,
      ...this.additionalProps
    }
  }

}