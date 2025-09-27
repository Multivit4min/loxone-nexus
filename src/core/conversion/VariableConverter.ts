import { SmartActuatorRGBWType, SmartActuatorSingleChannelType, VariableDataTypes } from "../../types/general"
import { SerializedDataType } from "./SerializedDataType"
import { stringToNumber } from "./stringToNumber"
import { DATA_TYPE } from "loxone-ici"

type Handlers<R> = {
  [K in SerializedDataType["type"]]: (data: Extract<SerializedDataType, { type: K }>, defaults: R) => R
}

export class VariableConverter {

  defaults = {
    string: () => "",
    number: () => 0,
    boolean: () => false,
    smartActuatorSingleChannel: ({ channel, fadeTime}: Partial<SmartActuatorSingleChannelType> = {}): SmartActuatorSingleChannelType => ({
      channel: VariableConverter.getMinMaxValue({ value: channel, min: 0, max: 100 }),
      fadeTime: VariableConverter.getMinMaxValue({ value: fadeTime, min: 0, fallback: 2 })
    }),
    smartActuatorRGBW: ({ red, green, blue, white, fadeTime, bits }: Partial<SmartActuatorRGBWType> = {}): SmartActuatorRGBWType => ({
      red: VariableConverter.getMinMaxValue({ value: red, min: 0, max: 100 }),
      green: VariableConverter.getMinMaxValue({ value: green, min: 0, max: 100 }),
      blue: VariableConverter.getMinMaxValue({ value: blue, min: 0, max: 100 }),
      white: VariableConverter.getMinMaxValue({ value: white, min: 0, max: 100 }),
      fadeTime: VariableConverter.getMinMaxValue({ value: fadeTime, min: 0, fallback: 2 }),
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
      return handler[this.type](this.valueType as any, fallback)
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
  toString(defaults: string = ""): string {
    return this.safeConvert(this.toStringHandler, defaults)
  }

  private toStringHandler: Handlers<string> = {
    number: ({ value }, defaults) => String(value),
    boolean: ({ value }, defaults) => String(value),
    string: ({ value }, defaults) => value,
    null: (_, defaults) => defaults,
    SmartActuatorSingleChannel: ({ value }, defaults) => `${value.channel}% ${value.fadeTime}s`,
    SmartActuatorRGBW: ({ value }, defaults) => {
      const r = VariableConverter.getHexValue(value.red, 0, 100)
      const g = VariableConverter.getHexValue(value.green, 0, 100)
      const b = VariableConverter.getHexValue(value.blue, 0, 100)
      const w = VariableConverter.getHexValue(value.white, 0, 100)
      return `#${r}${g}${b}${w} ${value.fadeTime}s`
    }
  }

  /** converts the datatype into a number */
  toNumber(defaults: number = 0): number {
    return this.safeConvert(this.toNumberHandler, defaults)
  }

  private toNumberHandler: Handlers<number> = {
    number: ({ value }, defaults) => value,
    boolean: ({ value }, defaults) => value ? 1 : 0,
    string: ({ value }) => stringToNumber(value),
    null: (_, defaults) => defaults,
    SmartActuatorSingleChannel: ({ value }, defaults) => value.channel,
    SmartActuatorRGBW: ({ value }, defaults) => {
      const r = VariableConverter.getHexValue(value.red, 0, 100)
      const g = VariableConverter.getHexValue(value.green, 0, 100)
      const b = VariableConverter.getHexValue(value.blue, 0, 100)
      const w = VariableConverter.getHexValue(value.white, 0, 100)
      return Math.floor(parseInt(`${r}${g}${b}${w}`, 16))
    }
  }

  /** converts the datatype into a boolean */
  toBoolean(defaults: boolean = false): boolean {
    return this.safeConvert(this.toBooleanHandler, defaults)
  }

  private toBooleanHandler: Handlers<boolean> = {
    number: ({ value }, defaults) => value !== 0 && !Number.isNaN(value),
    boolean: ({ value }, defaults) => value,
    string: ({ value }, defaults) => [
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
    null: (_, defaults) => defaults,
    SmartActuatorSingleChannel: ({ value }, defaults) => value.channel !== 0,
    SmartActuatorRGBW: ({ value }, defaults) => (value.red + value.green + value.blue + value.white) !== 0
  }

  /** converts any datatype into a SmartActuatorSingleChannelType */
  toSmartActuatorSingleChannel(defaults: Partial<SmartActuatorSingleChannelType> = {}): SmartActuatorSingleChannelType {
    return this.safeConvert(this.toSmartActuatorSingleChannelHandler, { channel: 0, fadeTime: 2, ...defaults })
  }

  private toSmartActuatorSingleChannelHandler: Handlers<SmartActuatorSingleChannelType> = {
    number: ({ value }, defaults) => this.defaults.smartActuatorSingleChannel({ ...defaults, channel: value }),
    boolean: ({ value }, defaults) => this.defaults.smartActuatorSingleChannel({ ...defaults, channel: value ? 100 : 0 }),
    string: ({ value }, defaults) => this.defaults.smartActuatorSingleChannel({ ...defaults, channel: stringToNumber(value) }),
    null: (_, defaults) => defaults,
    SmartActuatorSingleChannel: ({ value }, defaults) => value,
    SmartActuatorRGBW: ({ value }, defaults) => ({
      channel: Math.floor((value.red + value.green + value.blue + value.white) / 4),
      fadeTime: value.fadeTime
    })
  }

  /** converts any datatype into a SmartActuatorSingleChannelType */
  toSmartActuatorRGBW(defaults: Partial<SmartActuatorRGBWType> = {}): SmartActuatorRGBWType {
    return this.safeConvert(this.toSmartActuatorRGBWHandler, { red: 0, green: 0, blue: 0, white: 0, fadeTime: 2, bits: 0, ...defaults })
  }

  private toSmartActuatorRGBWHandler: Handlers<SmartActuatorRGBWType> = {
    number: ({ value }, defaults) => this.defaults.smartActuatorRGBW({ ...defaults, white: value }),
    boolean: ({ value }, defaults) => this.defaults.smartActuatorRGBW({ ...defaults, white: value ? 100 : 0 }),
    string: ({ value }, defaults) => this.defaults.smartActuatorRGBW({ ...defaults, white: stringToNumber(value) }),
    null: (_, defaults) => this.defaults.smartActuatorRGBW(defaults),
    SmartActuatorSingleChannel: ({ value }, defaults) => this.defaults.smartActuatorRGBW({ ...defaults, white: value.channel, fadeTime: value.fadeTime }),
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
        if (
          "red" in value &&
          "green" in value &&
          "blue" in value &&
          "white" in value &&
          "fadeTime" in value
        ) {
          return { type: "SmartActuatorRGBW", value }
        }
      default:
        return { type: "null", value: null }
    }
  }

  static getHexValue(n: number, fromMin = 0, fromMax = 255) {
    const value = VariableConverter.scaleNumber(n, fromMin, fromMax, 0, 255)
    return Math.floor(Math.max(0, Math.min(255, value))).toString(16).padStart(2, "0")
  }

  /**
   * scales a number from a specified scale
   * @param value number to scale
   * @param min start minimum number
   * @param max end maximum number
   * @param toMin new start of the number
   * @param toMax new end of the number
   */
  static scaleNumber(value: number, min: number, max: number, toMin: number, toMax: number) {
    return ((value - min) * (toMax - toMin)) / (max - min) + toMin
  }

  static getMinMaxValue({ value, fallback, min, max }: MinMaxValueProps) {
    if (value === undefined) return fallback || 0
    if (min !== undefined && value < min) return min
    if (max !== undefined && value > max) return max
    return value || 0
  }
}

export type MinMaxValueProps = {
  value?: number
  min?: number
  max?: number
  fallback?: number
}