import { NextFunction, Request, Response } from "express"
import { z } from "zod"
import { services } from "../../../container"
import { IntegrationInstance } from "../../../core/integration/IntegrationInstance"


export const updateIntegrationSchema = z.object({
  label: z.string().min(1),
  config: z.any()
}).strict()


export const createIntegrationVariableSchema = (integration: IntegrationInstance<any>) => {
  const input = z.object({
    label: z.string().min(1),
    direction: z.literal("INPUT"),
    props: integration.inputs.schema
  })
  const output = z.object({
    label: z.string().min(1),
    direction: z.literal("OUTPUT"),
    props: integration.actions.schema
  })
  return z.discriminatedUnion("direction", [input, output])
}

export type CreateIntegrationVariableProps = z.infer<ReturnType<typeof createIntegrationVariableSchema>>


export const integrationController = {

  //get a list of integration configs
  async config(req: Request, res: Response) {
    res.json(services.integrationManager.getConfig())
  },

  //list all integration
  async all(req: Request, res: Response) {
    res.json(services.integrationManager.serialize())
  },

  //retrieve a single integration
  async integration(req: Request, res: Response) {
    const integration = services.integrationManager.getId(parseInt(req.params.id, 10))
    res.json(integration.serialize())
  },

  //create a integration
  async createIntegration(req: Request, res: Response) {
    const schema = services.integrationManager.getCommonIntegrationSchema()
    const { label, type, ...config } = schema.parse(req.body)
    const integration = await services.integrationManager.create({ label, type, config })
    res.json(integration.serialize())
  },

  //create a integration
  async updateIntegration(req: Request, res: Response) {
    const body = updateIntegrationSchema.parse(req.body)
    const integration = services.integrationManager.getId(parseInt(req.params.id, 10))
    const config: any = integration.getConstructor().configSchema().parse(body.config)
    await integration.update({ label: body.label, config })
    res.json(integration.serialize())
  },

  async getTree(req: Request, res: Response) {
    const integration = services.integrationManager.getId(parseInt(req.params.id, 10))
    const tree = await integration.tree()
    if (!tree) return res.json({})
    return res.json(tree)
  },

  //remove a integration
  async removeIntegration(req: Request, res: Response) {
    await services.integrationManager.remove(parseInt(req.params.id, 10))
    res.sendStatus(200)
  },

  async createIntegrationVariable(req: Request, res: Response) {
    const integration = services.integrationManager.getId(parseInt(req.params.id, 10))
    const props = createIntegrationVariableSchema(integration).parse(req.body)
    const variable = await integration.variables.create({
      label: props.label,
      direction: props.direction,
      config: props.props
    })
    res.json(variable.serialize())
  },  
  
  async updateIntegrationVariable(req: Request, res: Response) {
    const integration = services.integrationManager.getId(parseInt(req.params.id, 10))
    const variable = await integration.variables.getId(parseInt(req.params.variableId, 10))
    const { label, props } = createIntegrationVariableSchema(integration).parse({
      ...req.body,
      direction: variable.entity.direction
    })
    await variable.update({ label, config: props as any })
    res.json(variable.serialize())
  },

  async deleteIntegrationVariable(req: Request, res: Response) {
    const integration = services.integrationManager.getId(parseInt(req.params.id, 10))
    await integration.variables.remove(parseInt(req.params.variableId, 10))
    res.json(integration.serialize())
  },

  async customRoutes(req: Request, res: Response, next: NextFunction) {
    const integration = services.integrationManager.findId(parseInt(req.params.id, 10))
    if (!integration) return res.sendStatus(404)
    return integration.authenticatedRouter(req, res, next)
  }

}