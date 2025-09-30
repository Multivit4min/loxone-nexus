export type VariableDataTypes = 
  string|number|boolean| //basics
  SmartActuatorSingleChannelType|SmartActuatorRGBWType|SmartActuatorTunableWhiteType //lights

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

export type SmartActuatorTunableWhiteType = {
  temperature: number
  brightness: number
  fadeTime: number
}