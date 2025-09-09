import { HaosCommander } from "../HaosCommander"

export interface HaosCommand {
  prepareSend?(): void
}

export abstract class HaosCommand<T extends HaosCommand.BasePayload = any, R = any> {

  state: HaosCommand.State = HaosCommand.State.INIT

  id: number|undefined = undefined
  internalId: number
  timeout: number = 5000
  private _timeout?: NodeJS.Timeout
  protected resolve?: (data: R) => void
  protected reject?: (err: Error) => void

  private data: HaosCommand.BasePayload = {
    type: ""
  }

  constructor(protected parent: HaosCommander, readonly props: HaosCommand.Props = {}) {
    this.internalId = parent.nextInternalId
  }

  abstract readonly type: string
  
  get minimumState() {
    return this.props.minHAState || 3
  }

  get noId() {
    return Boolean(this.props.noId)
  }
  
  get keep() {
    return Boolean(this.props.keep)
  }

  inState(...state: HaosCommand.State[]) {
    return state.includes(this.state)
  }

  protected abstract handleResponse(
    res: Record<string, any>,
    resolve: (data?: any) => void,
    reject: (err: Error) => void
  ): Promise<void>

  setResponse(res: Record<string, any>) {
    if (this.state !== HaosCommand.State.PENDING) return
    this.clearTimeoutTimer()
    this.state = HaosCommand.State.RECEIVED
    if (!this.resolve || !this.reject)
      return console.error(`no resolver (${!!this.resolve}) or reject (${!!this.reject}) function found`)
    this.handleResponse(
      res,
      this.handleResolve.bind(this, this.resolve),
      this.handleReject.bind(this, this.reject)
    ).finally(() => {
      delete this.resolve
      delete this.reject
    })
  }

  private handleResolve(resolve: (res: R) => void, data: R) {
    this.state = HaosCommand.State.RECEIVED_OK
    resolve(data)
  }

  private handleReject(reject: (err: Error) => void, err: Error) {
    this.state = HaosCommand.State.RECEIVED_FAILED
    reject(err)
  }

  get content() {
    if (!this.noId && !this.id) this.id = this.parent.nextId
    const content = { ...this.data }
    if (this.id) content.id = this.id
    return content
  }

  reset() {
    this.state = HaosCommand.State.REQUESTED
    this.clearTimeoutTimer()
    this.id = undefined
  }

  setContent(payload: Omit<T, "type">|T) {
    this.data = { ...payload, type: this.type }
    return this
  }

  send(payload?: Omit<T, "type">): Promise<R> {
    this.setContent(payload!)
    if (this.prepareSend) this.prepareSend()
    return new Promise<R>((resolve, reject) => {
      this.resolve = resolve
      this.reject = reject
      this.state = HaosCommand.State.REQUESTED
      return this.parent.sendCommand(this)
    })
  }

  setTimeout(time: number) {
    this.timeout = time
    return this
  }

  startTimeoutTimer() {
    this._timeout = setTimeout(() => {
      if (!this.reject) return
      this.state = HaosCommand.State.RECEIVED_TIMEOUT
      this.reject(new Error(`waiting for response timed out (took > ${this.timeout}ms)`))
    }, this.timeout)
  }

  clearTimeoutTimer() {
    clearTimeout(this._timeout)
  }

}

export namespace HaosCommand {

  export type Props = {
    minHAState?: HaosCommander.State
    noId?: boolean
    keep?: boolean
  }

  export type BasePayload = {
    id?: number
    type: string
  }

  export enum State {
    INIT,
    REQUESTED,
    PENDING,
    RECEIVED,
    RECEIVED_OK,
    RECEIVED_FAILED,
    RECEIVED_TIMEOUT
  }

}