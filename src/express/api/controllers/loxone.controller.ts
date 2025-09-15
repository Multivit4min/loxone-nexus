import { Request, Response } from "express"
import { z } from "zod"
import { services } from "../../../container"
import { DATA_TYPE } from "loxone-ici"

export const instanceSchema = z.object({
  label: z.string().min(1),
  host: z.ipv4().or(z.ipv6()),
  port: z.number().int().min(1024).max(65535),
  listenPort: z.number().int().min(1024).max(65535),
  remoteId: z.string().min(1).max(8),
  ownId: z.string().min(1).max(8)
}).strict()

export const createVariableSchema = z.object({
  packetId: z.string().min(1).max(8),
  direction: z.enum(["INPUT", "OUTPUT"]),
  type: z.enum({
    "DIGITAL": DATA_TYPE.DIGITAL,
    "ANALOG": DATA_TYPE.ANALOG,
    "TEXT": DATA_TYPE.TEXT,
    "SMART_ACTUATOR_SINGLE_CHANNEL": DATA_TYPE.SmartActuatorSingleChannel
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
    const body = instanceSchema.parse(req.body)
    const instance = services.loxoneManager.getId(parseInt(req.params.id, 10))
    await instance.update(body)
    res.json(instance.serialize())
  },

  //create a loxone Instance
  async createInstance(req: Request, res: Response) {
    const body = instanceSchema.parse(req.body)
    const instance = await services.loxoneManager.create({ active: false, ...body })
    res.json(instance.serialize())
  },

  //remove a loxone Instance
  async removeInstance(req: Request, res: Response) {
    await services.loxoneManager.remove(parseInt(req.params.id, 10))
    res.sendStatus(200)
  },

  //starts the loxone instance
  async start(req: Request, res: Response) {
    await services.loxoneManager.getId(parseInt(req.params.id, 10)).start()
    res.sendStatus(200)
  },

  //stops the loxone instance
  async stop(req: Request, res: Response) {
    await services.loxoneManager.getId(parseInt(req.params.id, 10)).stop()
    res.sendStatus(200)
  },

  async createVariable(req: Request, res: Response) {
    const body = createVariableSchema.parse(req.body)
    const instance = services.loxoneManager.getId(parseInt(req.params.id, 10))
    const variable = await instance.variables.create(body as any)
    res.json(variable.serialize())
  },

  async updateVariable(req: Request, res: Response) {
    const body = updateInputVariableSchema.parse(req.body)
    await services.loxoneManager
      .getId(parseInt(req.params.id, 10))
      .variables
      .getId(parseInt(req.params.variableId, 10))
      .update(body)
    res.sendStatus(200)
  },

  async deleteVariable(req: Request, res: Response) {
    const instance = services.loxoneManager.getId(parseInt(req.params.id, 10))
    await instance.variables.remove(parseInt(req.params.variableId, 10))
    res.sendStatus(200)
  },

  async variables(req: Request, res: Response) {
    const instance = services.loxoneManager.getId(parseInt(req.params.id, 10))
    res.json(instance.serialize().variables)
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