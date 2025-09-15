import { Request, Response } from "express"
import { z } from "zod"
import { services } from "../../../container"

export const userCreateSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(6)
}).strict()

export const userUpdateSchema = z.object({
  username: z.string().min(1).optional(),
  password: z.string().min(6).optional()
}).strict()

const stripPassword = ({ password, ...user }: Record<string, any>) => user

export const userController = {
  async getAll(req: Request, res: Response) {
    res.json((await services.userService.all()).map(user => stripPassword(user)))  
  },
  async create(req: Request, res: Response) {
    const body = userCreateSchema.parse(req.body)
    res.json(stripPassword(await services.userService.create(body.username, body.password)))
  },
  async delete(req: Request, res: Response) {
    await services.userService.remove(parseInt(req.params.userId, 10))
    res.json({})
  },
  async update(req: Request, res: Response) {
    const body = userUpdateSchema.parse(req.body)
    const id = parseInt(req.params.userId, 10)
    res.json(stripPassword(await services.userService.updateUser({ id, ...body })))
  }
}