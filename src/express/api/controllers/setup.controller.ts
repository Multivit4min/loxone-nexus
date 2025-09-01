import { Request, Response } from "express"
import { NextFunction } from "http-proxy-middleware/dist/types"
import { z } from "zod"
import { services } from "../../../container"
import { logger } from "../../../logger"

export const setupSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(6)
}).strict()


export const setupStore = {
  enable: false //true = setup is enabled
}

export const setupController = {
  async requiresSetup(req: Request, res: Response, next: NextFunction) {
    if (setupStore.enable) return void next()
    res.sendStatus(404)
  },

  async setup(req: Request, res: Response) {
    const body = setupSchema.parse(req.body)
    const user = await services.userService.create(body.username, body.password)
    logger.info(`Setup completed created user ${user.username}`)
    setupStore.enable = false
    res.json(services.authService.sign(user))
  }
}