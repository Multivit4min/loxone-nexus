import { SmartActuatorRGBWType, SmartActuatorSingleChannelType, VariableDataTypes } from "../../types/general"
import { SerializedDataType } from "./SerializedDataType"
import { stringToNumber } from "./stringToNumber"
import { DATA_TYPE } from "loxone-ici"

type Handlers<R> = {
  [K in SerializedDataType["type"]]: (data: Extract<SerializedDataType, { type: K }>) => R
}

export class VariableConverter {

  defaults = {
    string: () => "",
    number: () => 0,
    boolean: () => false,
    smartActuatorSingleChannel: ({ channel, fadeTime}: Partial<SmartActuatorSingleChannelType> = {}): SmartActuatorSingleChannelType => ({
      channel: channel !== undefined ? channel : 0,
      fadeTime: fadeTime !== undefined ? fadeTime : 2
    }),
    smartActuatorRGBW: ({ red, green, blue, white, fadeTime, bits }: Partial<SmartActuatorRGBWType> = {}): SmartActuatorRGBWType => ({
      red: red || 0,
      green: green || 0,
      blue: blue || 0,
      white: white || 0,
      fadeTime: fadeTime || 2,
      bits: bits || 0
    })
  }

  constructor(private data: SerializedDataType|null) {

  }

  get valueType(): SerializedDataType {
    if (this.data === null) return { type: "null", value: null }
    return this.data
  }

  get type() {
    return this.valueType.type
  }

  get value() {
    return this.valueType.value
  }

  private safeConvert<T = any>(handler: Handlers<T>, fallback: T) {
    try {
      return handler[this.type](this.valueType as any)
    } catch (e) {
      return fallback
    }
  }

  toLoxoneType(type: DATA_TYPE) {
    switch (type) {
      case DATA_TYPE.ANALOG: return this.toNumber()
      case DATA_TYPE.DIGITAL: return this.toBoolean()
      case DATA_TYPE.TEXT: return this.toString()
      case DATA_TYPE.SmartActuatorSingleChannel: return this.toSmartActuatorSingleChannel()
      case DATA_TYPE.SmartActuatorRGBW: return this.toSmartActuatorRGBW()
      case DATA_TYPE.SmartActuatorTunableWhite:
      case DATA_TYPE.T5:
      default:
        throw new Error(`type ${type} not implemented`)
    }
  }

  /** converts the datatype into a string */
  toString(): string {
    return this.safeConvert(this.toStringHandler, "")
  }

  private toStringHandler: Handlers<string> = {
    number: ({ value }) => String(value),
    boolean: ({ value }) => String(value),
    string: ({ value }) => value,
    null: () => this.defaults.string(),
    SmartActuatorSingleChannel: ({ value }) => `${value.channel}% ${value.fadeTime}s`,
    SmartActuatorRGBW: ({ value }) => {
      const r = VariableConverter.getHexValue(value.red)
      const g = VariableConverter.getHexValue(value.green)
      const b = VariableConverter.getHexValue(value.blue)
      const w = VariableConverter.getHexValue(value.white)
      return `#${r}${g}${b}${w} fade: ${value.fadeTime}`
    }
  }

  /** converts the datatype into a number */
  toNumber(): number {
    return this.safeConvert(this.toNumberHandler, 0)
  }

  private toNumberHandler: Handlers<number> = {
    number: ({ value }) => value,
    boolean: ({ value }) => value ? 1 : 0,
    string: ({ value }) => stringToNumber(value),
    null: () => this.defaults.number(),
    SmartActuatorSingleChannel: ({ value }) => value.channel,
    SmartActuatorRGBW: ({ value }) => {
      const r = VariableConverter.getHexValue(value.red)
      const g = VariableConverter.getHexValue(value.green)
      const b = VariableConverter.getHexValue(value.blue)
      const w = VariableConverter.getHexValue(value.white)
      return parseInt(`${r}${g}${b}${w}`, 16)
    }
  }

  /** converts the datatype into a boolean */
  toBoolean(): boolean {
    return this.safeConvert(this.toBooleanHandler, false)
  }

  private toBooleanHandler: Handlers<boolean> = {
    number: ({ value }) => value !== 0 && !Number.isNaN(value),
    boolean: ({ value }) => value,
    string: ({ value }) => [
      "on", "true", "1", "ok", "active",
      "open", "opening",
      "unlocked", "unlocking",
      "running", "armed", "arming",
      "playing", "buffering",
      "heating", "cooling",
      "drying", "fan",
      "above_horizon",
      "cleaning", "returning"
    ].includes(value.toLowerCase().trim()),
    null: () => this.defaults.boolean(),
    SmartActuatorSingleChannel: ({ value }) => value.channel !== 0,
    SmartActuatorRGBW: ({ value }) => (value.red + value.green + value.blue + value.white) !== 0
  }

  /** converts any datatype into a SmartActuatorSingleChannelType */
  toSmartActuatorSingleChannel(): SmartActuatorSingleChannelType {
    return this.safeConvert(this.toSmartActuatorSingleChannelHandler, { channel: 0, fadeTime: 2 })
  }

  private toSmartActuatorSingleChannelHandler: Handlers<SmartActuatorSingleChannelType> = {
    number: ({ value }) => this.defaults.smartActuatorSingleChannel({ channel: value }),
    boolean: ({ value }) => this.defaults.smartActuatorSingleChannel({ channel: value ? 100 : 0 }),
    string: ({ value }) => this.defaults.smartActuatorSingleChannel({ channel: stringToNumber(value) }),
    null: () => this.defaults.smartActuatorSingleChannel(),
    SmartActuatorSingleChannel: ({ value }) => value,
    SmartActuatorRGBW: ({ value }) => ({
      channel: (value.red + value.green + value.blue + value.white) / 5,
      fadeTime: value.fadeTime
    })
  }

  /** converts any datatype into a SmartActuatorSingleChannelType */
  toSmartActuatorRGBW(): SmartActuatorRGBWType {
    return this.safeConvert(this.toSmartActuatorRGBWHandler, { red: 0, green: 0, blue: 0, white: 0, fadeTime: 2, bits: 0 })
  }

  private toSmartActuatorRGBWHandler: Handlers<SmartActuatorRGBWType> = {
    number: ({ value }) => this.defaults.smartActuatorRGBW({ white: value }),
    boolean: ({ value }) => this.defaults.smartActuatorRGBW({ white: value ? 100 : 0 }),
    string: ({ value }) => this.defaults.smartActuatorRGBW({ white: stringToNumber(value) }),
    null: () => this.defaults.smartActuatorRGBW(),
    SmartActuatorSingleChannel: ({ value }) => this.defaults.smartActuatorRGBW({ white: value.channel, fadeTime: value.fadeTime }),
    SmartActuatorRGBW: ({ value }) => value
  }

  /**
   * detects the type and returns the object to serialize / deserialize it
   * @param value 
   * @returns 
   */
  static SerializeDataType(value: VariableDataTypes|null): SerializedDataType {
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

  static getHexValue(n: number, padLen: number = 2) {
    return Math.max(0, Math.min(255, n)).toString(16).padStart(padLen, "0")
  }
}