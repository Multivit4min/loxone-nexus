import { Request, Response } from "express"
import { z } from "zod"
import { services } from "../../../container"


export const updateIntegrationSchema = z.object({
  label: z.string().min(1),
  config: z.any()
}).strict()

export const createIntegrationSchema = updateIntegrationSchema.extend({
  name: z.string().min(1),
})


export const createIntegrationVariableSchema = <T extends z.Schema>(zodObject: T) => z.object({
  label: z.string().min(1),
  type: z.enum(["input", "output"]),
  integration: zodObject
})

export type CreateIntegrationVariableProps<T extends z.Schema> = z.infer<ReturnType<typeof createIntegrationVariableSchema<T>>>


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
    const integration = services.integrationManager.findById(req.params.id)
    if (!integration) return void res.status(404).json({ error: "Integration not found" })
    res.json(integration.serialize())
  },

  //create a integration
  async createIntegration(req: Request, res: Response) {
    const body = createIntegrationSchema.parse(req.body)
    const constructor = services.integrationManager.getRegisteredConstructor(body.name)
    if (!constructor) return void res.status(404).json({ error: `Integration ${body.name} not found` })
    constructor.configSchema().parse(body.config)
    const integration = await services.integrationManager.createIntegration(body)
    res.json(integration.serialize())
  },

  //create a integration
  async updateIntegration(req: Request, res: Response) {
    const body = updateIntegrationSchema.parse(req.body)
    const integration = services.integrationManager.findById(req.params.id)
    if (!integration) return void res.status(404).json({ error: "Integration not found" })
    const config: any = integration.getConstructor().configSchema().parse(body.config)
    await integration.update({ label: body.label, config })
    res.json(integration.serialize())
  },

  //retrieve the variables for an integration
  async internalVariables(req: Request, res: Response) {
    const integration = services.integrationManager.findById(req.params.id)
    if (!integration) return void res.status(404).json({ error: "Integration not found" })
    res.json(await integration.getInternalVariables())
  },

  //remove a integration
  async removeIntegration(req: Request, res: Response) {
    await services.integrationManager.removeIntegration(req.params.id)
    res.sendStatus(200)
  },

  async createIntegrationVariable(req: Request, res: Response) {
    const integration = services.integrationManager.findById(req.params.id)
    if (!integration) return void res.status(404).json({ error: "Integration not found" })
    const varSchema = integration.getConstructor().getVariableSchema()
    const props = createIntegrationVariableSchema(varSchema).parse(req.body)
    const variable = await integration.createVariable(props as any)
    res.json({ variable: variable.serialize() })
  },

  async deleteIntegrationVariable(req: Request, res: Response) {
    const integration = services.integrationManager.findById(req.params.id)
    if (!integration) return void res.status(404).json({ error: "Integration not found" })
    integration.variables.remove(req.params.variableId)
    res.json({})
  }

}