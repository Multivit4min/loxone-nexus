import { LoxoneVariableType } from "@prisma/client"
import { DATA_TYPE, LoxoneIOPacket } from "loxone-ici"

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
   * tries to convert a string to the desired Loxone Variable Type
   * @param type loxone data type to convert to
   * @param value data which tries to get converted
   * @returns 
   */
  static parseLoxoneTypeFromString(type: LoxoneVariableType, value: string) {
    switch (type) {
      case LoxoneVariableType.ANALOG: return TypeConversion.parseNumber(value)
      case LoxoneVariableType.DIGITAL: return TypeConversion.parseBoolean(value)
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

}