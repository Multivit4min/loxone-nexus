import express from "express"
import http from "http"
import bodyParser from "body-parser"
import { apiRouter } from "./api/index"
import { createProxyMiddleware } from "http-proxy-middleware"
import { createSocketServer } from "../realtime/socket"
import history from "connect-history-api-fallback"
import { logger } from "../logger/pino"
import pinoHttp from "pino-http"
import { Socket } from "net"
import { services } from "../container"

const timeouts: Record<string, NodeJS.Timeout> = {}

export async function setupExpress() {
  const httpLogger = pinoHttp({
    logger,
    autoLogging: false,
    serializers: {
      req() { return undefined },
      res() { return undefined },
    }
  })

  const app = express()
  app.set("trust proxy", true)
  const server = http.createServer(app)
  
  const sockets = new Set<Socket>()
  server.on("connection", socket => {
    sockets.add(socket)
    socket.on("close", () => sockets.delete(socket))
  })

  const { close: closeWSS } = createSocketServer(server)

  app.use(bodyParser.json())
  app.use(bodyParser.urlencoded({ extended: false }))

  app.use("/hook/:id", (req, res, next) => {
    const integration = services.integrationManager.findId(parseInt(req.params.id, 10))
    if (!integration) return res.sendStatus(404)
    return integration.router(req, res, next)
  })
  app.use("/api", httpLogger)
  app.use("/api", (req, res, next) => {
    const TIMEOUT = 5000 //max expected request duration
    const start = process.hrtime.bigint()
    const id = String(start)
    timeouts[id] = setTimeout(() => {
      req.log.debug(`${req.method} ${req.url} takes longer than expected...`)
    }, TIMEOUT)
    res.on("finish", () => {
      clearTimeout(timeouts[id])
      delete timeouts[id]
      const durationMs = Number(process.hrtime.bigint() - start) / 1e6;
      req.log.debug(`${req.method} ${req.url}: Code ${res.statusCode} in ${durationMs.toFixed(2)}ms`)
    })
    next()
  })
  app.use("/api", apiRouter)

  if (process.env.VITE_PROXY) {
    logger.warn(`using vite proxy to ${process.env.VITE_PROXY}`)
    app.use(createProxyMiddleware({
      target: process.env.VITE_PROXY,
      changeOrigin: true,
      ws: true
    }))
  } else {
    logger.warn(`serving files from public folder`)
    app.use(express.static("public"))
    app.use(history())
    app.use(express.static("public"))
  }

  server.listen(process.env.LISTEN_PORT, () => logger.info(`Express listening on ${process.env.LISTEN_PORT}`))

  return {
    close() {
      return new Promise<void>(fulfill => {
        server.close(() => fulfill()) 
        Object.values(timeouts).map(timeout => clearTimeout(timeout))
        closeWSS()
        server.closeAllConnections()
        server.closeIdleConnections()
        for (const socket of sockets) {
          socket.destroy()
        }
      })
    }
  }
}