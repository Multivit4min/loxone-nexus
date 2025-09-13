import { Socket } from "socket.io"
import { SocketClient } from "./SocketClient"
import { ServiceContainer } from "../container"
import { LoxoneInstance } from "../loxone/LoxoneInstance"
import { LoxoneVariableService } from "../loxone/variables/LoxoneVariableService"
import { IntegrationEntry } from "../core/integration/IntegrationInstance"
import { IntegrationVariable } from "../core/integration/variables/IntegrationVariable"
import { logger } from "../logger/pino"

export class SocketManager {

  private initialized = false
  private sockets: SocketClient[] = []
  services!: ServiceContainer
  logger = logger.child({}, { msgPrefix: "[SocketManager] " })

  constructor() {

  }

  init(services: ServiceContainer) {
    this.services = services
    this.initialized = true
  }

  create(socket: Socket) {
    if (!this.initialized) return false
    const client = new SocketClient(this, socket)
    this.sockets.push(client)
    return client
  }

  /**
   * removes a socket from the manager and disconnects it
   * @param socketId 
   * @returns 
   */
  remove(socketId: string) {
    const socket = this.sockets.find(socket => socket.socket.id === socketId)
    if (!socket) return null
    if (!socket.socket.disconnected) socket.socket.disconnect()
    socket.socket.removeAllListeners()
    this.sockets = this.sockets.filter(s => s === socket)
    return socket
  }

  /**
   * retrieves a list of all authenticated sockets
   * @returns 
   */
  getAuthenticated() {
    return this.sockets.filter(socket => socket.authenticated)
  }

  sendInstance(instance: LoxoneInstance) {
    this.logger.debug(`Sending instance ${instance.entity.label} (${instance.id})`)
    const serialized = instance.serialize()
    this.getAuthenticated().map(socket => socket.sendInstance(serialized))
  }

  sendVariable(variable: LoxoneVariableService) {
    this.logger.silent(`Sending Loxone variable ${variable.entity.packetId} (${variable.id}) to ${variable.entity.loxoneId}`)
    const serialized = variable.serialize()
    this.getAuthenticated().map(socket => socket.sendVariable(variable.entity.loxoneId, serialized))
  }

  /**
   * sends the state of the instances to all connected and authenticated socket clients
   */
  sendInstances() {
    this.logger.debug(`Sending all instances`)
    const instances = this.services.loxoneManager.serialize()
    this.getAuthenticated().map(socket => socket.sendInstances(instances))
  }

  /**
   * sends the state of the datasource to all connected and authenticated socket clients
   */
  sendIntegrations() {
    this.logger.debug(`Sending all integrations`)
    const integrations = this.services.integrationManager.serialize()
    this.getAuthenticated().map(socket => socket.sendIntegrations(integrations))
  }

  /**
   * sends the state of the datasource to all connected and authenticated socket clients
   */
  sendIntegration(integration: IntegrationEntry<any>) {
    this.logger.debug(`Sending integration ${integration.label} (${integration.id})`)
    const data = integration.serialize()
    this.getAuthenticated().map(socket => socket.sendIntegration(data))
  }


  sendIntegrationVariable(variable: IntegrationVariable) {
    this.logger.silent(`Sending Integration variable ${variable.entity.label} (${variable.id})`)
    const data = variable.serialize()
    this.getAuthenticated().map(socket => socket.sendIntegrationVariable(data))
  }

}