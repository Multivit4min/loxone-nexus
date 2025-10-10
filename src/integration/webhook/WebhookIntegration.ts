import z from "zod"
import { IntegrationInstance } from "../../core/integration/IntegrationInstance"
import { TreeBuilder } from "../../core/integration/tree/TreeBuilder"
import { Response, Request } from "express"
import _ from "lodash"


export class WebhookIntegration extends IntegrationInstance<
  z.infer<ReturnType<typeof WebhookIntegration.configSchema>>
> {

  async initialize() {
    this.publicRouter.use("/:name", this.handleRequest.bind(this))
    this.inputs
      .create("hook")
      .describe("webhook which can set an output")
      .schema({
        routeName: z.string().min(1).describe("route name on which the webhook listens to"),
        duration: z.number().positive().describe("duration in milliseconds for how long the variable should be set before it gets reset again"),
        token: z.string().optional().describe("optional secret to use in Authorization header (Authorization: Bearer <token>)")
      })
    this.inputs
      .create("hook_json")
      .describe("webhook which extracts data from a POST body")
      .schema({
        routeName: z.string().min(1).describe("route name on which the webhook listens to"),
        path: z.string().describe("path for the json content to extract, for example: foo[0].bar.baz"),
        token: z.string().optional().describe("optional secret to use in Authorization header (Authorization: Bearer <token>)")
      })
  }

  private async handleRequest(req: Request, res: Response) {
    try {
      const count = (await Promise.all([
        this.handleBooleanHook(req),
        this.handleJSONHook(req)
      ])).reduce((acc, curr) => acc+curr, 0)
      if (count === 0) return res.sendStatus(404)
    } catch (e) {
      this.logger.error(e, `failed to handle webhook`)
    }
    res.sendStatus(200)
  }

  private async handleBooleanHook(req: Request): Promise<number> {
    const variables = this.getVariables(req, "hook")
    await Promise.all(variables.map(async v => {
      if (!this.matchAuthorizationToken(v.config.token, req)) return
      await v.updateValue(true)
      let count = v.getStoreProperty<number>("count", 0)
      await v.updateStore({ count: ++count, last: new Date() })
      setTimeout(() => v.updateValue(false), v.config.duration)
    }))
    return variables.length
  }

  private async handleJSONHook(req: Request): Promise<number> {
    if (req.method !== "POST") return 0
    const variables = this.getVariables(req, "hook_json")
    await Promise.all(variables.map(async v => {
      if (!this.matchAuthorizationToken(v.config.token, req)) return
      await v.updateValue(_.get(req.body, v.config.path))
      let count = v.getStoreProperty<number>("count", 0)
      await v.updateStore({ count: ++count, last: new Date() })
      setTimeout(() => v.updateValue(false), v.config.duration)
    }))
    return variables.length
  }

  /**
   * get a list of variables matching the request and action name criteria
   * @param req 
   * @param action 
   * @returns 
   */
  private getVariables(req: Request, action: string) {
    return this.variables.collection.filter(v => (
      v.config.action === action &&
      v.config.routeName === req.params.name &&
      v.isInput
    ))
  }

  private matchAuthorizationToken(token: string|undefined, req: Request) {
    if (!token) return true
    const { authorization } = req.headers
    if (!authorization) return false
    const match = authorization.match(/^Bearer (.*)$/i)
    if (!match) return false
    return match[1] === token
  }

  async start() {}

  async stop() {}

  specificSerialize() {
    return {}
  }

  static configSchema() {
    return z.object()
  }
}