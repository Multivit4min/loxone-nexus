import z from "zod"
import { IntegrationInstance } from "../../core/integration/IntegrationInstance"
import { HomeAssistant } from "./hass/HomeAssistant"
import { Integration, IntegrationVariable as VariableEntity } from "@prisma/client"
import { HomeAssistantVariable } from "./HomeAssistantVariable"
import { IntegrationVariableManager } from "../../core/integration/variables/IntegrationVariableManager"
import { VariableDataTypes } from "../../types/general"
import { IntegrationManager } from "../../core/integration/IntegrationManager"
import { ActionCallback, ActionProps } from "../../core/integration/actions/Action"

export class HomeAssistantIntegration extends IntegrationInstance<
  z.infer<ReturnType<typeof HomeAssistantIntegration.configSchema>>
> {

  ha?: HomeAssistant

  constructor(entity: Integration, parent: IntegrationManager) {
    super(entity, parent, HomeAssistantIntegration)
    /** domain: switch */
    this.actions.create("switch.set")
      .describe("sets the switch on or off")
      .schema({ entityId: z.string().min(1) })
      .execute(async ({ value, config }) => {
        if (!this.ha) return
        return this.ha.callService({
          domain: "switch",
          service: value.toBoolean() ? "turn_on" : "turn_off",
          service_data: { entity_id: config.entityId }
        })
      })
    /** domain: light */
    this.actions.create("light.brightness")
      .describe("sets the brightness of a light in % (0 = off)")
      .schema({
        entityId: z.string().min(1),
        fadeTime: z.number().min(0).describe("fade time in seconds").optional()
      })
      .execute(async ({ value, config }) => {
        if (!this.ha) return
        const sma = value.toSmartActuatorSingleChannel()
        let transition = sma.fadeTime
        if (value.type !== "SmartActuatorSingleChannel" && config.fadeTime !== undefined) {
          transition = config.fadeTime
        }
        const serviceData: Record<string, any> = { entity_id: config.entityId, transition }
        const service = sma.channel > 0 ? "turn_on" : "turn_off"
        if (service === "turn_on") {
          serviceData.brightness = Math.round(sma.channel * 2.55)
          if (serviceData.brightness < 0) serviceData.brightness = 0
          if (serviceData.brightness > 255) serviceData.brightness = 255
        }
        return this.ha.callService({ domain: "light", service, service_data: serviceData })
      })
    this.actions.create("light.set")
      .describe("sets the brightness of a light in % (0 = off)")
      .schema({ entityId: z.string().min(1) })
      .execute(async ({ value, config }) => {
        if (!this.ha) return
        return this.ha.callService({
          domain: "light",
          service: value.toBoolean() ? "turn_on" : "turn_off",
          service_data: { entity_id: config.entityId }
        })
      })
    /** domain: button */
    this.actions.create("button.press")
      .schema({ entityId: z.string().min(1) })
      .execute(this.triggerAction({ domain: "button", service: "press", trigger: "positive" }))
    /** domain: counter */
    this.actions.create("counter.increment")
      .schema({ entityId: z.string().min(1) })
      .execute(this.triggerAction({ domain: "counter", service: "increment", trigger: "positive" }))
    this.actions.create("counter.decrement")
      .schema({ entityId: z.string().min(1) })
      .execute(this.triggerAction({ domain: "counter", service: "decrement", trigger: "positive" }))
    this.actions.create("counter.reset")
      .schema({ entityId: z.string().min(1) })
      .execute(this.triggerAction({ domain: "counter", service: "reset", trigger: "positive" }))
    /** domain: media_player */
    this.actions.create("media_player.turn_on")
      .schema({ entityId: z.string().min(1) })
      .execute(this.triggerAction({ domain: "media_player", service: "turn_on", trigger: "positive" }))
    this.actions.create("media_player.turn_off")
      .schema({ entityId: z.string().min(1) })
      .execute(this.triggerAction({ domain: "media_player", service: "turn_off", trigger: "negative" }))
    this.actions.create("media_player.volume_up")
      .schema({ entityId: z.string().min(1) })
      .execute(this.triggerAction({ domain: "media_player", service: "volume_up", trigger: "positive" }))
    this.actions.create("media_player.volume_down")
      .schema({ entityId: z.string().min(1) })
      .execute(this.triggerAction({ domain: "media_player", service: "volume_down", trigger: "positive" }))
    this.actions.create("media_player.media_play")
      .schema({ entityId: z.string().min(1) })
      .execute(this.triggerAction({ domain: "media_player", service: "media_play", trigger: "positive" }))
    this.actions.create("media_player.media_pause")
      .schema({ entityId: z.string().min(1) })
      .execute(this.triggerAction({ domain: "media_player", service: "media_pause", trigger: "positive" }))
    this.actions.create("media_player.media_stop")
      .schema({ entityId: z.string().min(1) })
      .execute(this.triggerAction({ domain: "media_player", service: "media_stop", trigger: "positive" }))
    this.actions.create("media_player.media_next_track")
      .schema({ entityId: z.string().min(1) })
      .execute(this.triggerAction({ domain: "media_player", service: "media_next_track", trigger: "positive" }))
    this.actions.create("media_player.media_previous_track")
      .schema({ entityId: z.string().min(1) })
      .execute(this.triggerAction({ domain: "media_player", service: "media_previous_track", trigger: "positive" }))
    this.actions.create("media_player.volume_set")
      .schema({ entityId: z.string().min(1) })
      .execute(this.numberAction({ domain: "media_player", service: "volume_set", key: "volume_level" }))
    /** domain: water_heater */
    this.actions.create("water_heater.turn_on")
      .schema({ entityId: z.string().min(1) })
      .execute(this.triggerAction({ domain: "water_heater", service: "turn_on", trigger: "positive" }))
    this.actions.create("water_heater.turn_off")
      .schema({ entityId: z.string().min(1) })
      .execute(this.triggerAction({ domain: "water_heater", service: "turn_off", trigger: "negative" }))
    this.actions.create("water_heater.set_temperature")
      .schema({ entityId: z.string().min(1) })
      .execute(this.numberAction({ domain: "water_heater", service: "set_temperature", key: "temperature" }))
    /** domain: valve */
    this.actions.create("valve.open_valve")
      .schema({ entityId: z.string().min(1) })
      .execute(this.triggerAction({ domain: "valve", service: "open_valve", trigger: "positive" }))
    this.actions.create("valve.close_valve")
      .schema({ entityId: z.string().min(1) })
      .execute(this.triggerAction({ domain: "valve", service: "close_valve", trigger: "negative" }))
    this.actions.create("water_heater.set_valve_position")
      .schema({ entityId: z.string().min(1) })
      .execute(this.numberAction({ domain: "water_heater", service: "set_valve_position", key: "position" }))
    /** domain: lock */
    this.actions.create("lock.lock")
      .schema({ entityId: z.string().min(1) })
      .execute(this.stringAction({ domain: "lock", service: "lock", key: "code" }))
    this.actions.create("lock.unlock")
      .schema({ entityId: z.string().min(1) })
      .execute(this.stringAction({ domain: "lock", service: "unlock", key: "code" }))
    this.actions.create("lock.open")
      .schema({ entityId: z.string().min(1) })
      .execute(this.stringAction({ domain: "lock", service: "open", key: "code" }))
    /** domain: cover */
    this.actions.create("cover.open_cover")
      .schema({ entityId: z.string().min(1) })
      .execute(this.triggerAction({ domain: "cover", service: "open_cover", trigger: "positive" }))
    this.actions.create("cover.close_cover")
      .schema({ entityId: z.string().min(1) })
      .execute(this.triggerAction({ domain: "cover", service: "close_cover", trigger: "negative" }))
    this.actions.create("cover.set_cover_position")
      .schema({ entityId: z.string().min(1) })
      .execute(this.numberAction({ domain: "cover", service: "set_cover_position", key: "position" }))
    this.actions.create("cover.open_cover_tilt")
      .schema({ entityId: z.string().min(1) })
      .execute(this.triggerAction({ domain: "cover", service: "open_cover_tilt", trigger: "positive" }))
    this.actions.create("cover.close_cover_tilt")
      .schema({ entityId: z.string().min(1) })
      .execute(this.triggerAction({ domain: "cover", service: "close_cover_tilt", trigger: "positive" }))
    this.actions.create("cover.stop_cover_tilt")
      .schema({ entityId: z.string().min(1) })
      .execute(this.triggerAction({ domain: "cover", service: "stop_cover_tilt", trigger: "positive" }))
    this.actions.create("cover.set_cover_tilt_position")
      .schema({ entityId: z.string().min(1) })
      .execute(this.numberAction({ domain: "cover", service: "set_cover_tilt_position", key: "tilt_position" }))
    /** domain: timer */
    this.actions.create("timer.start")
      .schema({ entityId: z.string().min(1) })
      .execute(this.triggerAction({ domain: "timer", service: "start", trigger: "positive" }))
    this.actions.create("timer.pause")
      .schema({ entityId: z.string().min(1) })
      .execute(this.triggerAction({ domain: "timer", service: "pause", trigger: "positive" }))
    this.actions.create("timer.cancel")
      .schema({ entityId: z.string().min(1) })
      .execute(this.triggerAction({ domain: "timer", service: "cancel", trigger: "positive" }))
    this.actions.create("timer.finish")
      .schema({ entityId: z.string().min(1) })
      .execute(this.triggerAction({ domain: "timer", service: "finish", trigger: "positive" }))
    /** domain: script */
    this.actions.create("script.turn_on")
      .schema({ entityId: z.string().min(1) })
      .execute(this.triggerAction({ domain: "script", service: "turn_on", trigger: "positive" }))
    this.actions.create("script.turn_off")
      .schema({ entityId: z.string().min(1) })
      .execute(this.triggerAction({ domain: "script", service: "turn_off", trigger: "negative" }))
    /** domain: script */
    this.actions.create("scene.turn_on")
      .schema({ entityId: z.string().min(1) })
      .execute(this.triggerAction({ domain: "scene", service: "turn_on", trigger: "negative" }))
  }

  triggerAction({ domain, service, trigger }: { domain: string, service: string, trigger?: "positive"|"negative" }) {
    return (({ config, value: converter }: ActionProps<any, any>) => {
      if (!this.ha) return
      const value = converter.toBoolean()
      if (trigger === "positive" && !value) return
      if (trigger === "negative" && value) return
      return this.ha.callService({ domain, service, service_data: { entity_id: config.entityId } })
    }) as ActionCallback<any, any>
  }

  numberAction({ domain, service, key }: { domain: string, service: string, key: string }) {
    return (({ config, value: converter }: ActionProps<any, any>) => {
      if (!this.ha) return
      return this.ha.callService({
        domain,
        service,
        service_data: { entity_id: config.entityId, [key]: converter.toNumber() }
      })
    }) as ActionCallback<any, any>
  }

  stringAction({ domain, service, ignoreEmpty, key }: { domain: string, service: string, ignoreEmpty?: boolean, key: string }) {
    return (({ config, value: converter }: ActionProps<any, any>) => {
      if (!this.ha) return
      const value = converter.toString()
      if (ignoreEmpty && value.length === 0) return
      return this.ha.callService({
        domain,
        service,
        service_data: { entity_id: config.entityId, [key]: value  }
      })
    }) as ActionCallback<any, any>
  }

  getConstructor() {
    return HomeAssistantIntegration
  }

  async start() {
    this.ha = await new HomeAssistant({
      url: this.config.ws,
      token: this.config.token,
      logger: this.logger
    }).connect()
    await this.variables.reload()
  }

  async stop() {
    if (!this.ha) return true
    try {
      await Promise.all(this.variables.collection.map(v => v.stop()))
      this.ha.disconnect()
      this.ha.removeAllListeners()
      this.ha = undefined
      return true
    } catch (e) {
      this.logger.error(e, `error during stop`)
      return false
    }
  }

  async getInternalVariables() {
    if (!this.ha) return []
    const states = await this.getStates()
    return { states }
  }

  async getStates(): Promise<{ entityId: string, namespace: string, id: string, values: Record<string, any> }[]> {
    if (!this.ha) return []
    const states = await this.ha.getStates()
    return states.map(state => {
      const [namespace, ...rest] = state.entity_id.split(".")
      if (namespace === undefined || rest.length === 0) return null
      return {
        entityId: state.entity_id,
        namespace,
        id: rest.join("."),
        values: {
          ...HomeAssistantIntegration.filterRecordsByType(state.attributes, ["string", "number", "boolean"]),
          state: state.state
        }
      }
    }).filter(res => res !== null)
  }

  async getStateByEntityId(id: string) {
    const states = await this.getStates()
    return states.find(i => i.entityId === id)
  }

  specificSerialize() {
    return null
  }

  static createIntegrationVariable(v: VariableEntity, parent: IntegrationVariableManager) {
    return new HomeAssistantVariable(v, parent)
  }

  static filterRecordsByType(attributes: Record<string, any>, types: string[]) {
    const result: Record<string, VariableDataTypes> = {}
    Object.keys(attributes).forEach(k => {
      if (!types.includes(typeof attributes[k])) return
      result[k] = attributes[k]
    })
    return result
  }

  static getVariableSchema() {
    return z.object({
      entityId: z.string().min(1),
      key: z.string().min(1)
    })
  }

  static configSchema() {
    return z.object({
      ws: z.url({ protocol: /^wss?$/ }).describe("Websocket URL to access HomeAssistant (wss://domain.tld)"),
      token: z.string().min(1).describe("HomeAssistant access token")
    })
  }
}

export type HomeAssistantDataSourceConfig = {
  ws: string
  token: string
}