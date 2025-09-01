import { Request, Response } from "express"
import { z } from "zod"
import { services } from "../../../container"
import { VariableDirection, LoxoneVariableType } from "@prisma/client"

export const instanceSchema = z.object({
  label: z.string().min(1),
  host: z.ipv4().or(z.ipv6()),
  port: z.number().int().min(1024).max(65535),
  remoteId: z.string().min(1).max(8)
}).strict()

export const createVariableSchema = z.object({
  packetId: z.string().min(1).max(8),
  direction: z.enum([
    VariableDirection.INPUT,
    VariableDirection.OUTPUT
  ]),
  type: z.enum([
    LoxoneVariableType.DIGITAL,
    LoxoneVariableType.ANALOG,
    LoxoneVariableType.TEXT
  ]),
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
    const instance = services.loxoneManager.getId(req.params.id)
    res.json(instance.serialize())
  },

  //retrieve a single instance
  async updateInstance(req: Request, res: Response) {
    const body = instanceSchema.parse(req.body)
    const instance = services.loxoneManager.getId(req.params.id)
    await instance.update(body)
    res.json(instance.serialize())
  },

  //create a loxone Instance
  async createInstance(req: Request, res: Response) {
    const body = instanceSchema.parse(req.body)
    const instance = await services.loxoneManager.create({ active: false, ownId: "loxmgr", ...body })
    res.json(instance.serialize())
  },

  //remove a loxone Instance
  async removeInstance(req: Request, res: Response) {
    await services.loxoneManager.remove(req.params.id)
    res.sendStatus(200)
  },

  //starts the loxone instance
  async start(req: Request, res: Response) {
    await services.loxoneManager.getId(req.params.id).start()
    res.sendStatus(200)
  },

  //stops the loxone instance
  async stop(req: Request, res: Response) {
    await services.loxoneManager.getId(req.params.id).stop()
    res.sendStatus(200)
  },

  async createVariable(req: Request, res: Response) {
    const body = createVariableSchema.parse(req.body)
    const instance = services.loxoneManager.getId(req.params.id)
    const variable = await instance.variables.create(body as any)
    res.json(variable.serialize())
  },

  async updateVariable(req: Request, res: Response) {
    const body = updateInputVariableSchema.parse(req.body)
    await services.loxoneManager
      .getId(req.params.id)
      .variables
      .getId(req.params.variableId)
      .update(body)
    res.sendStatus(200)
  },

  async deleteVariable(req: Request, res: Response) {
    const instance = services.loxoneManager.getId(req.params.id)
    await instance.variables.remove(req.params.variableId)
    res.sendStatus(200)
  },

  async variables(req: Request, res: Response) {
    const instance = services.loxoneManager.getId(req.params.id)
    res.json(instance.serialize().variables)
  },

  async forceVariable(req: Request, res: Response) {
    const body = forceVariableSchema.parse(req.body)
    const instance = services.loxoneManager.getId(req.params.id)
    const variable = instance.variables.getId(req.params.variableId)
    await variable.force(body.value)
    res.json(variable.serialize())
  },

  async unforceVariable(req: Request, res: Response) {
    const instance = services.loxoneManager.getId(req.params.id)
    const variable = instance.variables.getId(req.params.variableId)
    await variable.unforce()
    res.json(variable.serialize())
  },


}