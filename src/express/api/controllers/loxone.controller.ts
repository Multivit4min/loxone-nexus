import { Request, Response } from "express"
import { z } from "zod"
import { services } from "../../../container"
import { DATA_TYPE } from "loxone-ici"

export const createVariableSchema = z.object({
  packetId: z.string().min(1).max(8),
  direction: z.enum(["INPUT", "OUTPUT"]),
  type: z.enum({
    "DIGITAL": DATA_TYPE.DIGITAL,
    "ANALOG": DATA_TYPE.ANALOG,
    "TEXT": DATA_TYPE.TEXT,
    "SMART_ACTUATOR_RGBW": DATA_TYPE.SmartActuatorRGBW,
    "SMART_ACTUATOR_SINGLE_CHANNEL": DATA_TYPE.SmartActuatorSingleChannel,
    "SMART_ACTUATOR_TUNABLE_WHITE": DATA_TYPE.SmartActuatorTunableWhite
  }),
  label: z.string().optional(),
  suffix: z.string().nullable().optional(),
  description: z.string().nullable().optional()
}).strict()

export const updateInputVariableSchema = z.object({
  label: z.string().nullable().optional(),
  suffix: z.string().nullable().optional(),
  description: z.string().nullable().optional()
}).strict()

export const forceVariableSchema = z.object({
  value: z.any()
}).strict()

export const loxoneController = {

  //list all instances
  async all(req: Request, res: Response) {
    res.json(services.loxoneManager.serialize())
  },

  //retrieve a single instance
  async instance(req: Request, res: Response) {
    const instance = services.loxoneManager.getId(parseInt(req.params.id, 10))
    res.json(instance.serialize())
  },

  //retrieve a single instance
  async updateInstance(req: Request, res: Response) {
    const body = services.loxoneManager.schema().partial().parse(req.body)
    const instance = services.loxoneManager.getId(parseInt(req.params.id, 10))
    await instance.update(body)
    res.json(instance.serialize())
  },

  //create a loxone Instance
  async createInstance(req: Request, res: Response) {
    const body = services.loxoneManager.schema().parse(req.body)
    const instance = await services.loxoneManager.create({ active: false, ...body })
    res.json(instance.serialize())
  },

  //remove a loxone Instance
  async removeInstance(req: Request, res: Response) {
    await services.loxoneManager.remove(parseInt(req.params.id, 10))
    res.sendStatus(200)
  },

  //starts the loxone instance
  async test(req: Request, res: Response) {
    const instance = services.loxoneManager.getId(parseInt(req.params.id, 10))
    res.json(await instance.testConnection())
  },

  //starts the loxone instance
  async start(req: Request, res: Response) {
    const instance = services.loxoneManager.getId(parseInt(req.params.id, 10))
    await instance.start()
    res.json(instance.serialize())
  },

  //stops the loxone instance
  async stop(req: Request, res: Response) {
    const instance = services.loxoneManager.getId(parseInt(req.params.id, 10))
    await instance.stop()
    res.json(instance.serialize())
  },

  async createVariable(req: Request, res: Response) {
    const body = createVariableSchema.parse(req.body)
    const instance = services.loxoneManager.getId(parseInt(req.params.id, 10))
    const variable = await instance.variables.create(body as any)
    res.json(variable.serialize())
  },

  async updateVariable(req: Request, res: Response) {
    const body = updateInputVariableSchema.parse(req.body)
    const variable = services.loxoneManager
      .getId(parseInt(req.params.id, 10))
      .variables
      .getId(parseInt(req.params.variableId, 10))
    await variable.update(body)
    res.json(variable.serialize())
  },

  async deleteVariable(req: Request, res: Response) {
    const instance = services.loxoneManager.getId(parseInt(req.params.id, 10))
    await instance.variables.remove(parseInt(req.params.variableId, 10))
    res.json(instance.serialize())
  },

  async forceVariable(req: Request, res: Response) {
    const body = forceVariableSchema.parse(req.body)
    const instance = services.loxoneManager.getId(parseInt(req.params.id, 10))
    const variable = instance.variables.getId(parseInt(req.params.variableId, 10))
    await variable.force(body.value)
    res.json(variable.serialize())
  },

  async unforceVariable(req: Request, res: Response) {
    const instance = services.loxoneManager.getId(parseInt(req.params.id, 10))
    const variable = instance.variables.getId(parseInt(req.params.variableId, 10))
    await variable.unforce()
    res.json(variable.serialize())
  },


}