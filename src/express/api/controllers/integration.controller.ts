import { Request, Response } from "express"
import { z } from "zod"
import { services } from "../../../container"
import { VariableDirection } from "@prisma/client"


export const updateIntegrationSchema = z.object({
  label: z.string().min(1),
  config: z.any()
}).strict()

export const createIntegrationSchema = updateIntegrationSchema.extend({
  name: z.string().min(1),
})


export const createIntegrationVariableSchema = <T extends z.Schema>(zodObject: T) => z.object({
  label: z.string().min(1),
  direction: z.enum([VariableDirection.INPUT, VariableDirection.OUTPUT]),
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
    const integration = services.integrationManager.getId(req.params.id)
    res.json(integration.serialize())
  },

  //create a integration
  async createIntegration(req: Request, res: Response) {
    const body = createIntegrationSchema.parse(req.body)
    const constructor = services.integrationManager.getRegisteredConstructor(body.name)
    if (!constructor) return void res.status(404).json({ error: `Integration ${body.name} not found` })
    constructor.configSchema().parse(body.config)
    const integration = await services.integrationManager.create(body)
    res.json(integration.serialize())
  },

  //create a integration
  async updateIntegration(req: Request, res: Response) {
    const body = updateIntegrationSchema.parse(req.body)
    const integration = services.integrationManager.getId(req.params.id)
    const config: any = integration.getConstructor().configSchema().parse(body.config)
    await integration.update({ label: body.label, config })
    res.json(integration.serialize())
  },

  //retrieve the variables for an integration
  async internalVariables(req: Request, res: Response) {
    const integration = services.integrationManager.getId(req.params.id)
    res.json(await integration.getInternalVariables())
  },

  //remove a integration
  async removeIntegration(req: Request, res: Response) {
    await services.integrationManager.remove(req.params.id)
    res.sendStatus(200)
  },

  async createIntegrationVariable(req: Request, res: Response) {
    const integration = services.integrationManager.getId(req.params.id)
    const varSchema = integration.getConstructor().getVariableSchema()
    const props = createIntegrationVariableSchema(varSchema).parse(req.body)
    const variable = await integration.variables.create({
      label: props.label,
      direction: props.direction,
      config: props.integration as any
    })
    res.json({ variable: variable.serialize() })
  },

  async deleteIntegrationVariable(req: Request, res: Response) {
    const integration = services.integrationManager.getId(req.params.id)
    integration.variables.remove(req.params.variableId)
    res.json({})
  }

}