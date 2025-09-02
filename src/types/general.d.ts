export type VariableDataTypes = string|number|boolean|SmartActuatorSingleChannelType

export type SmartActuatorSingleChannelType = {
  channel: number
  fadeTime: number
}