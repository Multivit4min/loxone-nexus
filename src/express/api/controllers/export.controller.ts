import { Request, Response } from "express"
import { services } from "../../../container"
import { Exporter } from "../../../core/exporter/Exporter"
import { appService } from "../../.."


export const exportController = {
  async create(req: Request, res: Response) {
    const data = await services.exporter.createExport()
    res.json(data)
  },

  async upload(req: Request, res: Response) {
    const body = Exporter.parseSchema(req.body)
    await services.exporter.import(body)
    res.json({ message: "ok" })
    await appService.restart()
  }
}