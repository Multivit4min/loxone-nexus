import { Request, Response } from "express"
import { services } from "../../../container"
import z from "zod"
import { LinkError } from "../../../core/link/LinkError"
import { logger } from "../../../logger/pino"

export const createLinkSchema = z.object({
  integrationVariable: z.number().positive(),
  loxoneVariable: z.number().positive()
}).strict()

export const linkController = {

  async createLink(req: Request, res: Response) {
    const body = createLinkSchema.parse(req.body)
    try {
      const entity = await services.linkService.create({
        integrationVariableId: body.integrationVariable,
        loxoneVariableId: body.loxoneVariable
      })
      res.json(entity.serialize())
    } catch (e) {
      if (e instanceof LinkError) {
        res.status(400).json({ error: e.message })
      } else {
        logger.error(e, "unable to link variables")
        res.status(500).json({ error: "unable to link variables" })
      }
    }
  },

  async removeLink(req: Request, res: Response) {
    await services.linkService.remove(parseInt(req.params.id, 10))
    res.json({})
  }
}