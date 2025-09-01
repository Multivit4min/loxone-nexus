import { User } from "@prisma/client"
import { Socket } from "socket.io"
import { z } from "zod"
import { SocketManager } from "./SocketManager"

export class SocketClient {

  private user: User|null = null

  constructor(
    readonly parent: SocketManager,
    readonly socket: Socket
  ) {
    socket.on("auth:token", this.authenticate.bind(this))
    socket.on("auth:logout", this.logout.bind(this))
  }

  get authenticated() {
    return !!this.user
  }

  sendVariable(instanceId: string, variable: object) {
    this.socket.emit("instance:update.variable", { instanceId, variable })
  }

  sendInstance(instance: object) {
    this.socket.emit("instance:update.single", { instance })
  }

  sendInstances(instances = this.parent.services.loxoneManager.serialize()) {
    this.socket.emit("instance:update.all", { instances })
  }

  sendIntegrations(integrations = this.parent.services.integrationManager.serialize()) {
    this.socket.emit("integrations:update.all", { integrations })
  }

  sendIntegration(integration: object) {
    this.socket.emit("integrations:update.single", { integration })
  }

  sendIntegrationVariable(variable: object) {
    this.socket.emit("integrations:update.variable", { variable })
  }

  private async authenticate(data: any, ack: (data: any) => void) {
    const { token } = tokenSchema.parse(data)
    const user = await this.parent.services.userService.getByToken(token)
    if (!user) return ack(null)
    this.user = user
    ack({ id: user.id, username: user.username })
    this.sendInstances()
    this.sendIntegrations()
  }

  private logout(data: any, ack: (data: any) => void) {
    this.user = null
    ack(null)
  }

}

const tokenSchema = z.object({
  token: z.string().min(1)
}).strict()