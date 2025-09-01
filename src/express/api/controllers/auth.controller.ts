import { Request, Response } from "express"
import { z } from "zod"
import { services } from "../../../container"

export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required")
}).strict()

export const authController = {
  //login handler
  async login(req: Request, res: Response) {
    const body = loginSchema.parse(req.body)
    const data = await services.userService.login(body.username, body.password)
    if (!data) return void res.status(401).json({ error: "Invalid username or password" })
    res.json(data)  
  },

  async whoami(req: Request, res: Response) {
    try {
      const user = await req.store.getAuthentication()
      if (!user) return void res.sendStatus(401)
      return void res.json({
        user: { 
          id: user.id,
          username: user.username
        }
      })
    } catch (e) {
      return void res.sendStatus(401)
    }
  }
}