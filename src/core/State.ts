import { Logger } from "pino"

export class State {

  /** current state */
  private state: RunState

  /** state change promise */
  private stateChangePromise: Promise<void> | null = null
  private targetStateChange: RunState | null = null

  constructor(private props: StateProps<RunState>) {
    this.state = props.initialState
  }

  private get originalState() {
    return this.props.originalState
  }

  private get logger() {
    return this.props.logger
  }

  get current() {
    return this.state
  }

  async requestChange(target: RunState, cb: () => Promise<void>) {
    if (target === this.state) return
    if (this.targetStateChange !== null) {
      if (this.targetStateChange === target) return this.stateChangePromise
      throw new Error(`state change to "${this.targetStateChange}" already in progress to, cannot change to "${target}"`)
    }
    try {
      this.targetStateChange = target
      this.stateChangePromise = cb()
      await this.stateChangePromise
      this.set(target)
      this.targetStateChange = null
      this.stateChangePromise = null
    } catch (e) {
      this.targetStateChange = null
      this.stateChangePromise = null
      throw e
    }
  }

  /**
   * sets the current state to something else
   * @param state new state
   * @returns 
   */
  set(state: RunState) {
    //@ts-ignore
    this.logger.debug(`state changed from ${this.originalState[this.state]} to ${this.originalState[state]}`)
    this.state = state
    const { postStateChange } = this.props
    if (postStateChange) postStateChange(state)
    return this
  }
  
  /**
   * checks if the current state is one of the given states
   * @param states 
   * @returns 
   */
  in(...states: RunState[]) {
    return states.includes(this.state)
  }
}

export type StateProps<T> = {
  logger: Logger
  initialState: T
  readonly originalState: Record<string, string|number>
  postStateChange?: (state: T) => void
}


export enum RunState {
  INIT = 0,
  STOPPED = 1,
  STOPPING = 2,
  STARTING = 3,
  RUNNING = 4,
  ERROR = 5
}