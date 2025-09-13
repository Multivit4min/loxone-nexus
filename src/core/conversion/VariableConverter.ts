import { SmartActuatorSingleChannelType } from "../../types/general"
import { stringToNumber } from "./stringToNumber"
import { SerializedDataType } from "./TypeConversion"

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
    })
  }

  constructor(private valueType: SerializedDataType) {}

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

  /** converts the datatype into a string */
  toString(): string {
    return this.safeConvert(this.toStringHandler, "")
  }

  private toStringHandler: Handlers<string> = {
    number: ({ value }) => String(value),
    boolean: ({ value }) => String(value),
    string: ({ value }) => value,
    null: () => this.defaults.string(),
    SmartActuatorSingleChannel: ({ value }) => `${value.channel}% ${value.fadeTime}s`
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
    SmartActuatorSingleChannel: ({ value }) => value.channel
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
    SmartActuatorSingleChannel: ({ value }) => value.channel !== 0
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
    SmartActuatorSingleChannel: ({ value }) => value
  }
}