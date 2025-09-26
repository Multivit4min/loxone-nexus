import { Request, Response } from "express"
import { services } from "../../../container"

export const powerController = {

  async restart(req: Request, res: Response) {
    process.nextTick(() => services.appService.restart())
    res.sendStatus(200)
  }

}