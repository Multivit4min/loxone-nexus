import z from "zod"
import { IntegrationInstance } from "../../core/integration/IntegrationInstance"
import _ from "lodash"
import { ScriptWorker } from "./ScriptWorker"
import { template } from "./template"
import { LogEvent } from "./shared"

export class ScriptIntegration extends IntegrationInstance<
  z.infer<ReturnType<typeof ScriptIntegration.configSchema>>
> {

  worker?: ScriptWorker
  log: LogEvent[] = []

  async initialize() {
    this.setStoreProperty("active", this.getStoreProperty("active", true))
    this.authenticatedRouter.patch("/code", async (req, res) => {
      const { code } = z.object({ code: z.string() }).parse(req.body)
      await this.setStoreProperty("code", code)
      await this.reload()
      res.sendStatus(200)
    })
    this.authenticatedRouter.patch("/stop", async (req, res) => {
      this.setStoreProperty("active", false)
      this.stop()
      res.sendStatus(200)
    })
    this.authenticatedRouter.patch("/start", async (req, res) => {
      this.setStoreProperty("active", true)
      this.start()
      res.sendStatus(200)
    })
    this.inputs
      .create("script_variable")
      .describe("sets in input from within the script")
      .schema({ name: z.string().describe("name of the variable") })
      .currentValue(({ config }) => this.getStoreProperty(config.name))
    this.actions
      .create("script_variable")
      .describe("reads an output from within the script")
      .schema({ name: z.string().describe("name of the variable") })
      .execute(({ config, value }) => {
        if (!this.worker) return
        this.worker.updateOutput(config.name, value.value)
      })
  }

  addLog(log: LogEvent) {
    this.log.unshift(log)
    if (this.log.length > 100) this.log.pop()
    this.updateSpecific()
  }

  get code() {
    return this.getStoreProperty("code", template)
  }

  async start() {
    this.log = []
    if (!this.getStoreProperty("active")) return
    await this.stop()
    this.worker = new ScriptWorker(this)
    this.worker.run()
  }

  async stop() {
    if (this.worker) this.worker.destroy()
    this.worker = undefined
  }

  specificSerialize() {
    return {
      code: this.code,
      state: this.worker?.state || "NOT_INITIALIZED",
      active: this.getStoreProperty("active"),
      log: this.log
    }
  }

  static configSchema() {
    return z.object({})
  }
}