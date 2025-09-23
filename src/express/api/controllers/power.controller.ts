import { Request, Response } from "express"
import { appService } from "../../.."

export const powerController = {

  async restart(req: Request, res: Response) {
    process.nextTick(() => appService.restart())
    res.sendStatus(200)
  }

}