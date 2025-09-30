import { SmartActuatorRGBWType, SmartActuatorSingleChannelType, SmartActuatorTunableWhiteType } from "../../types/general"

export type SerializedDataType = 
  NumberDataType |
  BooleanDataType |
  StringDataType |
  SmartActuatorSingleChannelDataType |
  SmartActuatorRGBWDataType |
  SmartActuatorTunableWhiteDataType |
  NullDataType

  export type NumberDataType = {
  type: "number"
  value: number
}
export type BooleanDataType = {
  type: "boolean"
  value: boolean
}
export type StringDataType = {
  type: "string"
  value: string
}
export type NullDataType = {
  type: "null"
  value: null
}
export type SmartActuatorSingleChannelDataType = {
  type: "SmartActuatorSingleChannel"
  value: SmartActuatorSingleChannelType
}
export type SmartActuatorRGBWDataType = {
  type: "SmartActuatorRGBW",
  value: SmartActuatorRGBWType
}
export type SmartActuatorTunableWhiteDataType = {
  type: "SmartActuatorTunableWhite",
  value: SmartActuatorTunableWhiteType
}