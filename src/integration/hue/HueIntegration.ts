import z from "zod"
import { IntegrationInstance } from "../../core/integration/IntegrationInstance"
import { TreeBuilder } from "../../core/integration/tree/TreeBuilder"
import { v3 } from "node-hue-api"
import { Api } from "node-hue-api/dist/esm/api/Api"
import type { HueGroup, HueGroups, HueLights } from "./types"
import { OutputTreeEndpoint } from "../../core/integration/tree/OutputTreeEndpoint"
import { GroupState, LightState } from "@peter-murray/hue-bridge-model/dist/esm/model"
import { VariableConverter } from "../../core/conversion/VariableConverter"


export class HueIntegration extends IntegrationInstance<
  z.infer<ReturnType<typeof HueIntegration.configSchema>>
> {

  private api?: Api
  private bridge?: any
  private lights: HueLights = []
  private groups: HueGroups = []
  private interval!: NodeJS.Timeout

  async initialize(): Promise<any> {
    this.authenticatedRouter.get("/tree", async (req, res) => res.json(await this.tree()))
    this.actions.create("light.set")
      .describe("sets the light to on or off")
      .schema({ name: z.string().min(1) })
      .execute(async ({ config, value }) => {
        if (!this.api) return
        const light = this.getLightByName(config.name)
        if (!light) return this.logger.warn(`no hue light found with name ${config.name}`)
        await this.api.lights.setLightState(light.id, { on: value.toBoolean() })
      })
    this.actions.create("light.rgb")
      .describe("sets the lights rgb color")
      .schema({ name: z.string().min(1) })
      .execute(async ({ config, value }) => {
        if (!this.api) return
        const light = this.getLightByName(config.name)
        if (!light) return this.logger.warn(`no hue light found with name ${config.name}`)
        await this.api.lights.setLightState(light.id, this.getRGBState(value).getPayload())
      })    
    this.actions.create("light.temperature")
      .describe("sets the lights temperature and brightness")
      .schema({ name: z.string().min(1) })
      .execute(async ({ config, value }) => {
        if (!this.api) return
        const light = this.getLightByName(config.name)
        if (!light) return this.logger.warn(`no hue light found with name ${config.name}`)
        await this.api.lights.setLightState(light.id, this.getTemperatureState(value).getPayload())
      })
    this.actions.create("group.set")
      .describe("sets the group to on, off or a state from 0 to 100%")
      .schema({ name: z.string().min(1) })
      .execute(async ({ config, value }) => {
        if (!this.api) return
        const group = this.getGroupByName(config.name)
        if (!group) return this.logger.warn(`no hue group found with name ${config.name}`)
        const state = new GroupState()
        if (value.toBoolean()) {
          let { fadeTime, channel } = value.toSmartActuatorSingleChannel()
          state.transitionInMillis(fadeTime)
          state.on()
          if (channel > 100) channel = 100
          if (channel <= 0) channel = 1 
          state.brightness(channel)
        } else {
          state.off()
        }
        await this.api.groups.setGroupState(group.id, state.getPayload() as any)
      })
  }

  /** sets the state object for a color temperature */
  private getTemperatureState(value: VariableConverter, state: LightState = new LightState()) {
    if (value.toBoolean()) {
      const { temperature, brightness, fadeTime } = value.toSmartActuatorTunableWhite()
      state.on()
      state.ct(1_000_000 / temperature)
      state.brightness(brightness)
      state.transition(fadeTime * 1000)
    } else {
      state.off()
    }
    return state
  }

  private getRGBState(value: VariableConverter, state: LightState = new LightState()) {
    const sma = value.toSmartActuatorRGBW()
    if (sma.white === 0) { //RGB
      const rgb: [number, number, number] = [
        Math.floor(sma.red * 2.55),
        Math.floor(sma.green * 2.55),
        Math.floor(sma.blue * 2.55)
      ]
      if (rgb.some(c => c > 0)) {
        state.on() 
        state.rgb(...rgb)
      } else {
        state.off()
      }
    } else { //temperature
      return this.getTemperatureState(value, state)
    }
    return state
  }

  async start() {
    let username = this.getStoreProperty<string|undefined>("username", undefined)
    if (!username) {
      this.logger.info(`missing username in config, registering for new access... i hope you have your hue bridge button pressed`)
      const api = await v3.api.createLocal(this.config.address).connect()
      const user = await api.users.createUser("loxone-nexus")
      username = user.username
      await this.setStoreProperty("username", username)
    }
    this.api = await v3.api.createLocal(this.config.address).connect(username)
    this.bridge = (await this.api.configuration.getConfiguration()).getJsonPayload()
    this.interval = setInterval(() => this.updateLights(), 10 * 1000)
    await this.updateLights()
    await this.variables.reload()
  }

  async stop() {
    clearInterval(this.interval)
    this.lights = []
  }

  async updateLights() {
    if (!this.api) return
    try {
      const [lights, groups] = await Promise.all([
        this.api.lights.getAll(),
        this.api.groups.getAll()
      ])
      this.lights = lights.map(l => l.getJsonPayload() as any)
      this.groups = groups.map(g => g.getJsonPayload() as any)
    } catch (error) {
      this.logger.error({ error }, "cant update hue lights")
    }
  }

  getLightByName(name: string) {
    const light = this.lights.find(light => light.name.toLowerCase() === name.toLowerCase())
    if (!light) return undefined
    return light
  }

  getGroupByName(name: string) {
    const group = this.groups.find(group => group.name.toLowerCase() === name.toLowerCase())
    if (!group) return undefined
    return group
  }

  specificSerialize() {
    return {
      bridge: this.bridge,
      lights: this.lights,
      groups: this.groups
    }
  }

  async tree() {
    const tree = new TreeBuilder()
    const lightsCat = tree.addOutputCategory("lights")
    this.lights.forEach(light => {
      const lightCat = lightsCat.addCategory(light.name)
      lightCat.add(OutputTreeEndpoint, `set`)
        .className("text-amber")
        .setConfig({
          label: `${light.name} > set`,
          action: "light.set",
          name: light.name
        })      
      lightCat.add(OutputTreeEndpoint, `rgb`)
        .className("text-amber")
        .setConfig({
          label: `${light.name} > rgb`,
          action: "light.rgb",
          name: light.name
        })      
      lightCat.add(OutputTreeEndpoint, `temperature`)
        .className("text-amber")
        .setConfig({
          label: `${light.name} > temperature`,
          action: "light.temperature",
          name: light.name
        })
    })
    const groupsCat = tree.addOutputCategory("groups")
    this.groups.filter(group => ["Room", "Zone", "LightGroup"].includes(group.type)).forEach(group => {
      const count = group.lights.length
      const groupCat = groupsCat
        .addCategory(group.name)
        .icon(HueIntegration.getGroupIcon(group))
        .comment(`${count} light${count === 1 ? '' : 's'}`)
      groupCat.add(OutputTreeEndpoint, `set`)
        .className("text-amber")
        .setConfig({
          label: `${group.name} > set`,
          action: "group.set",
          name: group.name
        })
    })
    return tree.serialize()
  }

  static getGroupIcon(group: HueGroup) {
    switch (group.type) {
      case "Lunimarie":
      case "Lighsource":
      case "Zone":
      case "LightGroup": return "mdi-lightbulb-group"
      case "Room": return "mdi-home"
      case "Entertainment": return "mdi-audio-video"
      default: return "mdi-help"
    }
  }

  static configSchema() {
    return z.object({
      address: z.ipv4().describe("ipv4 address of the hue bridge")
    })
  }
}