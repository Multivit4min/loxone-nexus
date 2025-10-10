import z from "zod"
import { IntegrationInstance } from "../../core/integration/IntegrationInstance"
import { TreeBuilder } from "../../core/integration/tree/TreeBuilder"
import mqtt, { MqttClient } from "mqtt"
import { VariableDataTypes } from "../../types/general"
import _ from "lodash"


export class MqttIntegration extends IntegrationInstance<
  z.infer<ReturnType<typeof MqttIntegration.configSchema>>
> {

  private client?: MqttClient
  private messages: Record<string, { json: boolean, value: any }> = {}
  static KEEP_MESSAGE_TIME = 5 * 60 * 1000 //5 minutes


  async initialize() {
    this.authenticatedRouter.get("/topic/:name", (req, res) => {
      const topic = decodeURIComponent(req.params.name)
      if (!this.messages[topic]) return res.json(null)
      return res.json(this.messages[topic].value)
    })
    this.inputs
      .create("subscribe")
      .describe("subscribe to a mqtt topic")
      .schema({
        topic: z.string().min(1).describe("mqtt topic to listen"),
      })
    this.inputs
      .create("subscribe_json")
      .describe("subscribe to a mqtt topic which gets handles as json data")
      .schema({
        topic: z.string().min(1).describe("mqtt topic to listen to which provides json"),
        path: z.string().min(1).describe("path for example: data.humidity.value")
      })
    this.actions.create("publish")
      .describe("sends a value to the mqtt server")
      .schema({
        topic: z.string().min(1).describe("mqtt topic to publish to"),
      })
      .execute(({ config, value }) => {
        if (!this.client) throw new Error("mqtt not connected")
        return this.client.publishAsync(config.topic, value.toString())
      })
  }

  async start() {
    const { url, username, password } = this.config
    this.client = await mqtt.connectAsync(url, { username, password })
    await this.client.subscribeAsync("#")
    this.client.on("message", this.handleMessage.bind(this))
    await this.variables.reload()
    await Promise.all(this.variables.collection.map(v => v.updateStore({})))
  }

  async stop() {
    this.client?.removeAllListeners()
    this.client?.end()
  }

  async handleMessage(topic: string, buffer: Buffer) {
    const message = buffer.toString("utf-8")
    let exists = topic in this.messages
    try {
      this.messages[topic] = { json: true, value: JSON.parse(message) }
    } catch (e) {
      this.messages[topic] = { json: false, value: message }
    }
    if (!exists) this.services.socketManager.sendIntegration(this)
    const variables = this.variables.collection.filter(v => v.config.action.startsWith("subscribe") && v.config.topic === topic)
    if (variables.length === 0) return
    variables.forEach(async v => {
      if (v.config.action === "subscribe") {
        v.updateValue(message)
      } else if (v.config.action === "subscribe_json") {
        let value: VariableDataTypes|undefined
        if (!this.messages[topic].json) return this.logger.error(`${v.config.topic} does not seem to contain json`)
        v.setStoreProperty("data", this.messages[topic].value)
        value = _.get(this.messages[topic].value, v.config.path)
        if (value === undefined) return
        v.updateValue(typeof value === "object" ? JSON.stringify(value) : value)
      } else {
        this.logger.error(`invalid mqtt variable action ${v.config}`)
      }
    })
  }

  specificSerialize() {
    return {
      topics: Object.keys(this.messages)
    }
  }

  static configSchema() {
    return z.object({
      url: z.url().describe("mqtt server url for example: mqtt://test.mosquitto.org"),
      username: z.string().describe("username for authentication").optional(),
      password: z.string().describe("password for authentication").optional(),
    })
  }
}