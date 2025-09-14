import { LoxoneVariableType } from "@prisma/client"
import { DATA_TYPE, LoxoneIOPacket } from "loxone-ici"
import { logger } from "../../logger/pino"
import { SmartActuatorSingleChannelType, VariableDataTypes } from "../../types/general"

export class TypeConversion {

  /**
   * converts a string to a boolean value
   * @param value 
   * @returns 
   */
  static parseBoolean(value: string) {
    return ["on", "true", "active", "ok", "1"].includes(value.toLowerCase().trim())
  }
  
  /**
   * parses a string to a numeric value
   * @param value 
   * @returns 
   */
  static parseNumber(value: string) {
    const num = parseFloat(value)
    if (isNaN(num)) return 0
    return num
  }

  /**
   * Parses a json string to a smart actuator single channel
   * @param value 
   * @param fallback fallback value for invalid object or value types
   * @returns 
   */
  static parseSmartActuatorSingleChannel(value: string, fallback = { channel: 0, fadeTime: 2 }): SmartActuatorSingleChannelType {
    try {
      const { fadeTime, channel } = JSON.parse(value)
      return {
        fadeTime: typeof fadeTime !== "number" ? fallback.fadeTime : fadeTime,
        channel: typeof channel !== "number" ? fallback.channel : channel
      }
    } catch (e) {
      logger.error({ value }, `could not parse value to SmartActuatorSingleChannel`)
      return fallback
    }
  }

  /**
   * tries to convert a string to the desired Loxone Variable Type
   * @param type loxone data type to convert to
   * @param value data which tries to get converted
   * @returns 
   */
  static parseLoxoneTypeFromString(type: LoxoneVariableType, value: string) {
    switch (type) {
      case LoxoneVariableType.ANALOG: return TypeConversion.parseNumber(value)
      case LoxoneVariableType.DIGITAL: return TypeConversion.parseBoolean(value)
      case LoxoneVariableType.SMART_ACTUATOR_SINGLE_CHANNEL: return TypeConversion.parseSmartActuatorSingleChannel(value)
      default: return String(value)
    }
  }

  /**
   * tries to convert a string to the des
   * @param type 
   * @param value 
   * @returns 
   */
  static parseTypeFromString(type: "string"|"number"|"boolean", value: string) {
    switch (type) {
      case "number": return TypeConversion.parseNumber(value)
      case "boolean": return TypeConversion.parseBoolean(value)
      default: return String(value)
    }
  }

  /** convert the database LoxoneVariableType to LoxonesPacket Data Type */
  static LoxoneVariableTypeToDataType(type: LoxoneVariableType) {
    switch (type) {
      case LoxoneVariableType.DIGITAL: return DATA_TYPE.DIGITAL
      case LoxoneVariableType.ANALOG: return DATA_TYPE.ANALOG
      case LoxoneVariableType.TEXT: return DATA_TYPE.TEXT
      case LoxoneVariableType.T5: return DATA_TYPE.T5
      case LoxoneVariableType.SMART_ACTUATOR_RGBW: return DATA_TYPE.SmartActuatorRGBW
      case LoxoneVariableType.SMART_ACTUATOR_SINGLE_CHANNEL: return DATA_TYPE.SmartActuatorSingleChannel
      case LoxoneVariableType.SMART_ACTUATOR_TUNABLE_WHITE: return DATA_TYPE.SmartActuatorTunableWhite
      default: return DATA_TYPE.TEXT
    }
  }

  /**
   * retrieves the correct enum for the database from the loxone packet
   * @param packet 
   * @returns 
   */
  static LoxoneDataTypeToVariableType(packet: LoxoneIOPacket) {
    switch (packet.dataType) {
      case DATA_TYPE.ANALOG: return LoxoneVariableType.ANALOG
      case DATA_TYPE.DIGITAL: return LoxoneVariableType.DIGITAL
      case DATA_TYPE.TEXT: return LoxoneVariableType.TEXT
      case DATA_TYPE.T5: return LoxoneVariableType.T5
      case DATA_TYPE.SmartActuatorRGBW: return LoxoneVariableType.SMART_ACTUATOR_RGBW
      case DATA_TYPE.SmartActuatorSingleChannel: return LoxoneVariableType.SMART_ACTUATOR_SINGLE_CHANNEL
      case DATA_TYPE.SmartActuatorTunableWhite: return LoxoneVariableType.SMART_ACTUATOR_TUNABLE_WHITE
      default: throw new Error(`invalid loxone data type ${packet.dataType}`)
    }
  }

  /**
   * serializes the data type
   * @param value 
   * @returns 
   */
  static SerializeDataType(value: VariableDataTypes|null) {
    return JSON.stringify(TypeConversion.WrapType(value))
  }

  /**
   * detects the type and returns the object to serialize / deserialize it
   * @param value 
   * @returns 
   */
  static WrapType(value: VariableDataTypes|null): SerializedDataType {
    switch (typeof value) {
      case "number":
        value = parseFloat(value.toFixed(5))
      case "string": 
      case "boolean":
        return { type: <any>typeof value, value }
      case "object":
        if (value === null) return { type: "null", value: null }
        if ("channel" in value && "fadeTime" in value) {
          return { type: "SmartActuatorSingleChannel", value }
        }
      default:
        return { type: "null", value: null }
    }
  }

  /**
   * deserializes the data type
   * @param val 
   * @returns 
   */
  static DeserializeDataType(val: string|null): SerializedDataType {
    if (val === null) return { type: "null", value: null }
    try {
      const { type, value } = JSON.parse(val) as { type: string, value: VariableDataTypes }
      switch (type) {
        case "string": 
        case "number":
        case "boolean":
        case "SmartActuatorSingleChannel":
          return { type, value } as any
        case "unknown":
        default:
          return { type: "null", value: null }
      }
    } catch (e) {
      logger.error(e, `could not deserialize data: ${val}`)
      return { type: "null", value: null }
    }
  }

}

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