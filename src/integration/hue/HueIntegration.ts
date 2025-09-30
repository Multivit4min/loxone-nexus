import z from "zod"
import { IntegrationInstance } from "../../core/integration/IntegrationInstance"
import { IntegrationManager } from "../../core/integration/IntegrationManager"
import { IntegrationEntity } from "../../drizzle/schema"
import { TreeBuilder } from "../../core/integration/tree/TreeBuilder"
import { v3 } from "node-hue-api"
import { Api } from "node-hue-api/dist/esm/api/Api"
import type { HueLights } from "./types"
import { OutputTreeEndpoint } from "../../core/integration/tree/OutputTreeEndpoint"
import { SmartActuatorRGBWType } from "../../types/general"
import { LightState } from "@peter-murray/hue-bridge-model/dist/esm/model"
import { VariableConverter } from "../../core/conversion/VariableConverter"


export class HueIntegration extends IntegrationInstance<
  z.infer<ReturnType<typeof HueIntegration.configSchema>>
> {

  private api?: Api
  private bridge?: any
  private lights: HueLights = []
  private interval!: NodeJS.Timeout

  constructor(entity: IntegrationEntity, parent: IntegrationManager) {
    super(entity, parent, HueIntegration)
    this.actions.create("light.set")
      .describe("sets the light to on or off")
      .schema({
        name: z.string().min(1)
      })
      .execute(async ({ config, value }) => {
        if (!this.api) return
        const light = this.getLightByName(config.name)
        if (!light) return this.logger.warn(`no hue light found with name ${config.name}`)
        await this.api.lights.setLightState(light.id, { on: value.toBoolean() })
      })
    this.actions.create("light.rgbw")
      .describe("sets the lights rgbw color")
      .schema({
        name: z.string().min(1)
      })
      .execute(async ({ config, value }) => {
        if (!this.api) return
        const light = this.getLightByName(config.name)
        if (!light) return this.logger.warn(`no hue light found with name ${config.name}`)
        const sma = value.toSmartActuatorRGBW()
        const white = Math.floor(sma.white * 2.55)
        const rgb = [Math.floor(sma.red * 2.55), Math.floor(sma.green * 2.55), Math.floor(sma.blue * 2.55)]
        if (white === 0) { //RGB
          await this.api.lights.setLightState(light.id, { on: value.toBoolean(), rgb: rgb })
        } else {
          const state = new LightState()
          if (value.toBoolean()) {
            const tw = value.toSmartActuatorTunableWhite()
            state.on()
            state.white(1_000_000 / tw.temperature, tw.brightness)
            state.transition(sma.fadeTime)
          } else {
            state.off()
          }
          await this.api.lights.setLightState(light.id, state.getPayload())
        }
      })
  }

  getConstructor() {
    return HueIntegration
  }

  async start() {
    let { username, clientKey } = this.config
    if (!username) {
      this.logger.info(`missing username in config, registering for new access, i hope you have your hue bridge button`)
      const api = await v3.api.createLocal(this.config.address).connect()
      const user = await api.users.createUser("loxone-nexus")
      username = user.username
      clientKey = user.clientkey
      await this.update({ config: { ...this.config, username, clientKey }})
    }
    this.api = await v3.api.createLocal(this.config.address).connect(username, clientKey)
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
    const [lights, groups] = await Promise.all([
      this.api.lights.getAll(),
      this.api.groups.getAll()
    ])
    this.lights = lights.map(l => l.getJsonPayload() as any)
    //console.log(groups) todo
  }

  getLightByName(name: string) {
    const light = this.lights.find(light => light.name.toLowerCase() === name.toLowerCase())
    if (!light) return undefined
    return light
  }

  async getInternalVariables() {
    return null
  }

  specificSerialize() {
    return {
      bridge: this.bridge,
      lights: this.lights
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
      lightCat.add(OutputTreeEndpoint, `rgbw`)
        .className("text-amber")
        .setConfig({
          label: `${light.name} > rgbw`,
          action: "light.rgbw",
          name: light.name
        })
    })
    return tree.serialize()
  }

  static configSchema() {
    return z.object({
      address: z.ipv4().describe("ipv4 address of the hue bridge"),
      username: z.string().describe("leave empty, press the button on the hue bridge then click on create").optional(),
      clientKey: z.string().describe("leave empty, press the button on the hue bridge then click on create").optional()
    })
  }
}