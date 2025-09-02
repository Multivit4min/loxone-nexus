import { SmartActuatorSingleChannelType, VariableDataTypes } from "../../../types/general"
import { HomeAssistantIntegration } from "./HomeAssistantIntegration"

export class HomeAssistantLoxoneServices {

  constructor(readonly parent: HomeAssistantIntegration) {

  }

  get ha() {
    if (!this.parent.ha) throw new Error(`HomeAssistant not active`)
    return this.parent.ha
  }

  get callService() {
    return this.ha.callService.bind(this.ha)
  }

  findServiceAction(ns: string, name: string) {
    const actions = this.getServiceActions()
    const domain = actions[ns]
    if (!domain) return
    return domain.find(e => e.name === name)
  }

  getServiceActions(): ServiceActions {
    return {
      "switch": [{
        name: "set",
        description: "sets the switch on or off",
        type: "boolean",
        action: this.setSwitch.bind(this)
      }],
      "light": [{
        name: "setBrightness",
        description: "sets the brightness of a light in % (0 = off)",
        type: "SmartActuatorSingleChannel",
        action: this.setLightBrightness.bind(this)
      }, {
        name: "setLight",
        description: "sets a light to on or off",
        type: "boolean",
        action: this.setLight.bind(this)
      }],
      "button": [{
        name: "press",
        description: "presses the button",
        type: "boolean",
        payload: { trigger: "positive" },
        action: this.booleanServiceAction.bind(this)
      }],
      "counter": [{
        name: "increment",
        description: "increments the counter",
        type: "boolean",
        payload: { trigger: "positive" },
        action: this.booleanServiceAction.bind(this)
      }, {
        name: "decrement",
        description: "decrements the counter",
        type: "boolean",
        payload: { trigger: "positive" },
        action: this.booleanServiceAction.bind(this)
      }, {
        name: "reset",
        description: "resets the counter",
        type: "boolean",
        payload: { trigger: "positive" },
        action: this.booleanServiceAction.bind(this)
      }],
      "media_player": [{
        name: "turn_on",
        type: "boolean",
        payload: { trigger: "positive" },
        action: this.booleanServiceAction.bind(this)
      }, {
        name: "turn_off",
        type: "boolean",
        payload: { trigger: "negative" },
        action: this.booleanServiceAction.bind(this)
      }, {
        name: "volume_up",
        type: "boolean",
        payload: { trigger: "positive" },
        action: this.booleanServiceAction.bind(this)
      }, {
        name: "volume_down",
        type: "boolean",
        payload: { trigger: "positive" },
        action: this.booleanServiceAction.bind(this)
      }, {
        name: "media_play",
        type: "boolean",
        payload: { trigger: "positive" },
        action: this.booleanServiceAction.bind(this)
      }, {
        name: "media_pause",
        type: "boolean",
        payload: { trigger: "positive" },
        action: this.booleanServiceAction.bind(this)
      }, {
        name: "media_stop",
        type: "boolean",
        payload: { trigger: "positive" },
        action: this.booleanServiceAction.bind(this)
      }, {
        name: "media_next_track",
        type: "boolean",
        payload: { trigger: "positive" },
        action: this.booleanServiceAction.bind(this)
      }, {
        name: "media_previous_track",
        type: "boolean",
        payload: { trigger: "positive" },
        action: this.booleanServiceAction.bind(this)
      }, {
        name: "volume_set",
        type: "number",
        payload: { key: "volume_level" },
        action: this.numberServiceAction.bind(this)
      }],
      "water_heater": [{
        name: "turn_on",
        type: "boolean",
        payload: { trigger: "positive" },
        action: this.booleanServiceAction.bind(this)
      }, {
        name: "turn_off",
        type: "boolean",
        payload: { trigger: "positive" },
        action: this.booleanServiceAction.bind(this)
      }, {
        name: "set_temperature",
        type: "number",
        payload: { key: "temperature" },
        action: this.numberServiceAction.bind(this)
      }],
      "valve": [{
        name: "open_valve",
        type: "boolean",
        payload: { trigger: "positive" },
        action: this.booleanServiceAction.bind(this)
      }, {
        name: "close_valve",
        type: "boolean",
        payload: { trigger: "positive" },
        action: this.booleanServiceAction.bind(this)
      }, {
        name: "set_valve_position",
        type: "number",
        payload: { key: "position" },
        action: this.numberServiceAction.bind(this)
      }],
      "lock": [{
        name: "unlock",
        type: "string",
        payload: { key: "code", ignoreEmpty: true },
        action: this.stringServiceAction.bind(this)
      }, {
        name: "lock",
        type: "string",
        payload: { key: "code", ignoreEmpty: true },
        action: this.stringServiceAction.bind(this)
      }, {
        name: "open",
        type: "string",
        payload: { key: "code", ignoreEmpty: true },
        action: this.stringServiceAction.bind(this)
      }],
      "cover": [{
        name: "open_cover",
        type: "boolean",
        payload: { trigger: "positive" },
        action: this.booleanServiceAction.bind(this)
      }, {
        name: "close_cover",
        type: "boolean",
        payload: { trigger: "positive" },
        action: this.booleanServiceAction.bind(this)
      }, {
        name: "set_cover_position",
        type: "number",
        payload: { key: "position" },
        action: this.numberServiceAction.bind(this)
      }, {
        name: "stop_cover",
        type: "boolean",
        payload: { trigger: "positive" },
        action: this.booleanServiceAction.bind(this)
      }, {
        name: "open_cover_tilt",
        type: "boolean",
        payload: { trigger: "positive" },
        action: this.booleanServiceAction.bind(this)
      }, {
        name: "close_cover_tilt",
        type: "boolean",
        payload: { trigger: "positive" },
        action: this.booleanServiceAction.bind(this)
      }, {
        name: "stop_cover_tilt",
        type: "boolean",
        payload: { trigger: "positive" },
        action: this.booleanServiceAction.bind(this)
      }, {
        name: "set_cover_tilt_position",
        type: "number",
        payload: { key: "tilt_position" },
        action: this.numberServiceAction.bind(this)
      }],
      "timer": [{
        name: "start",
        type: "boolean",
        payload: { trigger: "positive" },
        action: this.booleanServiceAction.bind(this)
      }, {
        name: "pause",
        type: "boolean",
        payload: { trigger: "positive" },
        action: this.booleanServiceAction.bind(this)
      }, {
        name: "cancel",
        type: "boolean",
        payload: { trigger: "positive" },
        action: this.booleanServiceAction.bind(this)
      }, {
        name: "finish",
        type: "boolean",
        payload: { trigger: "positive" },
        action: this.booleanServiceAction.bind(this)
      }],
      "script": [{
        name: "turn_on",
        type: "boolean",
        payload: { trigger: "positive" },
        action: this.booleanServiceAction.bind(this)
      }, {
        name: "turn_off",
        type: "boolean",
        payload: { trigger: "positive" },
        action: this.booleanServiceAction.bind(this)
      }],
      "scene": [{
        name: "turn_on",
        type: "boolean",
        payload: { trigger: "positive" },
        action: this.booleanServiceAction.bind(this)
      }]
    }
  }

  async setSwitch({ domain, entityId, value }: ActionProps<number>) {
    const service = value ? "turn_on" : "turn_off"
    return this.callService({ domain, service, service_data: { entity_id: entityId } })
  }

  async setLightBrightness({ domain, entityId, value }: ActionProps<SmartActuatorSingleChannelType>) {
    const serviceData: Record<string, any> = { entity_id: entityId, transition: value.fadeTime }
    const service = value.channel > 0 ? "turn_on" : "turn_off"
    if (service === "turn_on") {
      serviceData.brightness = Math.round(value.channel)
      if (serviceData.brightness < 0) serviceData.brightness = 0
      if (serviceData.brightness > 255) serviceData.brightness = 255
    }
    return this.callService({ domain, service, service_data: serviceData })
  }

  async setLight({ domain, entityId, value }: ActionProps<number>) {
    return this.callService({
      domain,
      service: value ? "turn_on" : "turn_off",
      service_data: { entity_id: entityId }
    })
  }

  async booleanServiceAction({ domain, entityId, action, value }: ActionProps<number>) {
    if (action.payload.trigger === "positive" && !value) return
    if (action.payload.trigger === "negative" && value) return
    return this.callService({ domain, service: action.name, service_data: { entity_id: entityId } })
  }

  async numberServiceAction({ domain, entityId, action, value }: ActionProps<number>) {
    const service_data = {
      entity_id: entityId,
      [action.payload.key]: value
    }
    return this.callService({ domain, service: action.name, service_data })
  }

  async stringServiceAction({ domain, entityId, action, value }: ActionProps<string>) {
    if (action.payload.ignoreEmpty && value.length === 0) return
    const service_data = {
      entity_id: entityId,
      [action.payload.key]: value
    }
    return this.callService({ domain, service: action.name, service_data })
  }

}

export type ActionProps<T extends VariableDataTypes = any, P = any> = {
  action: ServiceActionEntry<T, P>
  domain: string
  entityId: string
  value: T
}

export type ServiceActions = Record<string, ServiceAction>
export type ServiceAction = ServiceActionEntry<any>[]
export type ServiceActionEntry<T extends VariableDataTypes = any, P = any> = {
  name: string
  description?: string
  type: ActionType
  payload?: P
  action: (props: ActionProps<T, P>) => Promise<void>
}

export type ActionType = "string"|"number"|"boolean"|"SmartActuatorSingleChannel"