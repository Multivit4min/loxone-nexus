import z from "zod"
import { IntegrationInstance } from "../../core/integration/IntegrationInstance"
import { TreeBuilder } from "../../core/integration/tree/TreeBuilder"
import { Request } from "express"


export class WebhookIntegration extends IntegrationInstance<
  z.infer<ReturnType<typeof WebhookIntegration.configSchema>>
> {

  async initialize() {
    this.inputs
      .create("hook")
      .describe("webhook which can set an output")
      .schema({
        routeName: z.string().min(1).describe("route name on which the webhook listens to"),
        duration: z.number().positive().describe("duration in milliseconds for how long the variable should be set before it gets reset again"),
        token: z.string().optional().describe("optional secret to use in Authorization header (Authorization: Bearer <token>)")
      })
      .currentValue(() => false)
      .register(() => () => {})
    this.publicRouter.use("/:name", async (req, res, next) => {
      const variables = this.variables.collection.filter(v => (
        v.config.action === "hook" &&
        v.config.routeName === req.params.name &&
        v.isInput
      ))
      if (variables.length === 0) return res.sendStatus(404)
      await Promise.all(variables.map(async v => {
        if (!this.matchAuthorizationToken(v.config.token, req)) return
        await v.updateValue(true)
        let count = v.getStoreProperty<number>("count", 0)
        await v.updateStore({ count: ++count, last: new Date() })
        setTimeout(() => v.updateValue(false), v.config.duration)
      }))
      res.sendStatus(200)
    })
  }

  private matchAuthorizationToken(token: string|undefined, req: Request) {
    if (!token) return true
    const { authorization } = req.headers
    if (!authorization) return false
    const match = authorization.match(/^Bearer (.*)$/i)
    if (!match) return false
    console.log(match[1], match, token)
    return match[1] === token
  }

  async start() {}

  async stop() {}

  specificSerialize() {
    return {}
  }

  async tree() {
    const tree = new TreeBuilder()
    return tree.serialize()
  }

  static configSchema() {
    return z.object()
  }
}