import { Request, Response } from "express"
import { services } from "../../../container"
import z from "zod"
import { LinkError } from "../../../link/LinkError"
import { logger } from "../../../logger/pino"

export const createLinkSchema = z.object({
  integrationVariable: z.string().min(1),
  loxoneVariable: z.any()
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
    await services.linkService.remove(req.params.id)
    res.json({})
  }
}