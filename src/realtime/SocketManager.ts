import { Socket } from "socket.io"
import { SocketClient } from "./SocketClient"
import { ServiceContainer } from "../container"
import { LoxoneInstance } from "../loxone/LoxoneInstance"
import { LoxoneVariableService } from "../loxone/variables/LoxoneVariableService"
import { IntegrationInstance } from "../core/integration/IntegrationInstance"
import { IntegrationVariable } from "../core/integration/variables/IntegrationVariable"
import { logger } from "../logger/pino"
import { IAppService } from "../types/appService"

export class SocketManager implements IAppService {

  private initialized = false
  private sockets: SocketClient[] = []
  services!: ServiceContainer
  logger = logger.child({}, { msgPrefix: "[SocketManager] " })

  constructor() {

  }

  async init(services: ServiceContainer) {
    this.services = services
    this.initialized = true
  }

  async stop() {
    await Promise.all(this.sockets.map(socket => socket.socket.disconnect(true)))
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

  /**
   * checks if there are any sockets connected
   * @param authenticated wether only authenticated sockets should be counted
   */
  hasSockets(authenticated = true) {
    if (authenticated) return this.getAuthenticated().length > 0
    return this.sockets.length > 0
  }

  sendInstance(instance: LoxoneInstance) {
    if (!this.hasSockets()) return
    this.logger.debug(`Sending instance ${instance.entity.label} (${instance.id})`)
    const serialized = instance.serialize()
    this.getAuthenticated().map(socket => socket.sendInstance(serialized))
  }

  sendVariable(variable: LoxoneVariableService) {
    if (!this.hasSockets()) return
    this.logger.silent(`Sending Loxone variable ${variable.entity.packetId} (${variable.id}) to ${variable.entity.loxoneId}`)
    const serialized = variable.serialize()
    this.getAuthenticated().map(socket => socket.sendVariable(variable.entity.loxoneId, serialized))
  }

  /**
   * sends the state of the instances to all connected and authenticated socket clients
   */
  sendInstances() {
    if (!this.hasSockets()) return
    this.logger.debug(`Sending all instances`)
    const instances = this.services.loxoneManager.serialize()
    this.getAuthenticated().map(socket => socket.sendInstances(instances))
  }

  /**
   * sends the state of the datasource to all connected and authenticated socket clients
   */
  sendIntegrations() {
    if (!this.hasSockets()) return
    this.logger.debug(`Sending all integrations`)
    const integrations = this.services.integrationManager.serialize()
    this.getAuthenticated().map(socket => socket.sendIntegrations(integrations))
  }

  /**
   * sends the state of the datasource to all connected and authenticated socket clients
   */
  sendIntegration(integration: IntegrationInstance<any>) {
    if (!this.hasSockets()) return
    this.logger.debug(`Sending integration ${integration.label} (${integration.id})`)
    const data = integration.serialize()
    this.getAuthenticated().map(socket => socket.sendIntegration(data))
  }

  sendIntegrationVariable(variable: IntegrationVariable) {
    if (!this.hasSockets()) return
    this.logger.silent(`Sending Integration variable ${variable.entity.label} (${variable.id})`)
    const data = variable.serialize()
    this.getAuthenticated().map(socket => socket.sendIntegrationVariable(data))
  }

  sendIntegrationSpecific(integration: IntegrationInstance<any>) {
    if (!this.hasSockets()) return
    this.logger.silent(`send integration specific data ${integration.label} (${integration.id})`)
    const specific = integration.specificSerialize()
    this.getAuthenticated().map(socket => socket.sendIntegrationSpecific({ id: integration.id, specific }))
  }

}