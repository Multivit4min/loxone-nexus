export type SerializedDataType = NumberDataType|BooleanDataType|StringDataType|SmartActuatorSingleChannelDataType|NullDataType
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