export type MessageToWorkerEvent = InitEvent|OutputVariableUpdateEvent
export type MessageToMainEvent = VariableUpdateEvent|InputVariableUpdateEvent|LogEvent

export type InitEvent = {
  type: "init"
  code: string
  outputs: Record<string, any>
}

export type InputVariableUpdateEvent = {
  type: "input:update"
  name: string
  value: any
}

export type OutputVariableUpdateEvent = {
  type: "output:update"
  name: string
  value: any
}

export type LogEvent = {
  type: "log"
  date: string
  level: string
  msg: string[]
}