import { NextFunction, Request, Response, Router } from "express"
import { ZodError, prettifyError } from "zod"
import setupRoutes from "./routes/setup.route"
import authRoutes from "./routes/auth.route"
import loxoneRoutes from "./routes/loxone.route"
import configRoutes from "./routes/config.route"
import datasourceRoutes from "./routes/integration.route"
import userRoutes from "./routes/user.route"
import linkRoutes from "./routes/link.route"
import exporterRoutes from "./routes/exporter.route"
import powerRoutes from "./routes/power.route"
import { isAuthenticated } from "../util/isAuthenticated"
import { ExpressStore } from "../util/ExpressStore"
import { CollectionItemNotFoundError } from "../../core/errors/CollectionItemNotFoundError"
import { setupStore } from "./controllers/setup.controller"

export const apiRouter = Router()

apiRouter.use((req, res, next) => {
  req.store = new ExpressStore(req, res)
  next()
})

apiRouter.get("/", (req, res) => {
  res.json({
    setup: setupStore.enable
  })
})
apiRouter.use(setupRoutes)
apiRouter.use(authRoutes)
apiRouter.use(isAuthenticated(), userRoutes)
apiRouter.use(isAuthenticated(), configRoutes)
apiRouter.use(isAuthenticated(), loxoneRoutes)
apiRouter.use(isAuthenticated(), datasourceRoutes)
apiRouter.use(isAuthenticated(), linkRoutes)
apiRouter.use(isAuthenticated(), exporterRoutes)
apiRouter.use(isAuthenticated(), powerRoutes)

//404 catch all handler
apiRouter.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.url} not found` })
})

apiRouter.use((err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof ZodError) {
    res.status(400).json({ error: prettifyError(err) })
  } else if (err instanceof CollectionItemNotFoundError) {
    res.status(404).json({ error: err.message })
  } else {
    req.log.error(err, "API Error")
    res.sendStatus(500)
  }
})
