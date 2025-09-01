import { Server } from "socket.io"
import http from "http"
import { services } from "../container"

export function createSocketServer(server: http.Server) {
  const io = new Server(server)

  io.on("connection", socket => {
    services.socketManager.create(socket)
    socket.on("disconnect", () => services.socketManager.remove(socket.id))
  })

  return io
}