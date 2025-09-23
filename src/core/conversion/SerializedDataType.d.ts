import { SmartActuatorRGBWType, SmartActuatorSingleChannelType } from "../../types/general"

export type SerializedDataType = 
  NumberDataType |
  BooleanDataType |
  StringDataType |
  SmartActuatorSingleChannelDataType |
  SmartActuatorRGBWDataType |
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