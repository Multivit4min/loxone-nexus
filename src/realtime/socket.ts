import { Server } from "socket.io"
import http from "http"
import { services } from "../container"
import msgPackParser from "socket.io-msgpack-parser"

export function createSocketServer(server: http.Server) {
  const io = new Server(server, { parser: msgPackParser })

  io.on("connection", socket => {
    services.socketManager.create(socket)
    socket.on("disconnect", () => services.socketManager.remove(socket.id))
  })

  const close = () => {
    io.close()
  }

  return { io, close }
}