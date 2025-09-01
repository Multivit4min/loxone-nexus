import { User } from "@prisma/client"
import { JWT_DATA } from "../api/auth/jwt"
import { ExpressStore } from "../express/util/ExpressStore"
import { Logger } from "pino"

declare module "express-serve-static-core" {
  interface Request {
     store: ExpressStore
     log: Logger
  }
}