export type VariableDataTypes = string|number|boolean|SmartActuatorSingleChannelType|SmartActuatorRGBWType

export type SmartActuatorSingleChannelType = {
  channel: number
  fadeTime: number
}

export type SmartActuatorRGBWType = {
  red: number
  green: number
  blue: number
  white: number
  fadeTime: number
  bits: number
}

