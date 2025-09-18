import { RunState, State } from "./State"
import { LoxoneManager } from "./LoxoneManager"
import { LoxoneRemoteSystem, LoxoneServer } from "loxone-ici"
import { LoxoneVariableManager } from "./variables/LoxoneVariableManager"
import { LoxoneVariableService } from "./variables/LoxoneVariableService"
import { Instance } from "../core/instance/Instance"
import { InstanceManager } from "../core/instance/InstanceManager"
import { Logger } from "pino"
import { logger } from "../logger/pino"
import { LoxoneEntity } from "../drizzle/schema"

export class LoxoneInstance extends Instance<LoxoneEntity> {

  readonly state: State
  readonly logger: Logger

  loxoneServer?: LoxoneServer
  remoteSystem?: LoxoneRemoteSystem

  //inputs which have not been defined but are being transmitted by loxone miniserver
  undefinedInputs: LoxoneVariableService[] = []
  readonly variables = new LoxoneVariableManager(this)

  constructor(entity: LoxoneEntity, parent: InstanceManager<LoxoneEntity, Instance<LoxoneEntity>>) {
    super(entity, parent)
    this.logger = logger.child({ id: this.id }, { msgPrefix: "[LoxoneInstance] " })
    this.state = new State({
      logger: this.logger,
      initialState: RunState.STOPPED,
      originalState: RunState,
      postStateChange: () => this.parent.services.socketManager.sendInstance(this)
    })
  }

  async init() {
    if (this.entity.active) {
      await this.start()
    } else {
      await this.reload()
    }
    return this
  }

  private async updateEntity(props: Partial<LoxoneEntity>) {
    const entity = await this.parent.repositories.loxone.update({
      id: this.id,
      ...props
    })
    if (!entity) throw new Error(`entity has been deleted but is still loaded`)
    this.entity = entity
  }

  private async setActive(set: boolean = true) {
    await this.updateEntity({ active: set })
  }

  async restart() {
    if (!this.state.in(RunState.RUNNING)) return
    await this.stop()
    await this.start()
  }

  /** reloads only the entity from database */
  async reload(entity?: LoxoneEntity) {
    this.logger.info("reloading instance")
    if (!entity) entity = await this.parent.repositories.loxone.findById(this.id) || undefined
    if (!entity) throw new Error(`could not find loxone instance with id ${this.id} while starting`)
    this.entity = entity
    await this.variables.reload()
    this.undefinedInputs = []
    this.parent.services.socketManager.sendInstance(this)
    return this
  }

  /**
   * updates properties of an instance and reloads it
   * @param entity 
   * @returns 
   */
  async update(entity: Partial<LoxoneEntity>) {
    await this.updateEntity(entity)
    await this.restart()
    this.parent.services.socketManager.sendInstance(this)
  }

  /** starts the server */
  start() {
    return this.state.requestChange(RunState.RUNNING, async () => {
      this.state.set(RunState.STARTING)
      await this.reload()
      this.loxoneServer = new LoxoneServer({ ownId: this.entity.ownId })
      this.loxoneServer.bind(this.entity.listenPort)
      this.remoteSystem = this.loxoneServer.createRemoteSystem({
        address: this.entity.host,
        port: this.entity.port,
        remoteId: this.entity.remoteId,
        suppressECONNREFUSED: true
      })
      this.loxoneServer.on("input", this.inputHandler.bind(this))
      this.parent.services.linkService.reloadLoxoneInstance(this.id)
      await this.setActive(true)
    })
  }

  /** stops the server */
  stop(deactivate = true) {
    return this.state.requestChange(RunState.STOPPED, async () => {
      this.state.set(RunState.STOPPING)
      if (this.loxoneServer) {
        await this.loxoneServer.close()
        this.loxoneServer.removeAllListeners()
        this.loxoneServer = undefined
      }
      if (this.remoteSystem) {
        await this.remoteSystem.close()
        this.remoteSystem.removeAllListeners()
        this.remoteSystem = undefined
      }
      if (deactivate) await this.setActive(false)
    })
  }

  /**
   * receives and handles the input event received from loxone miniserver
   */
  private async inputHandler(data: LoxoneServer.InputEvent) {
    const variable = this.variables.getByPacketId(data.packet.packetId)
    if (variable) return await variable.updateValueFromPacket(data.packet)
    let newVariable = this.undefinedInputs.find(v => v.packetId === data.packet.packetId)
    if (!newVariable) {
      newVariable = LoxoneVariableService.createFromPacket(data.packet, this.variables)
      this.undefinedInputs.push(newVariable)
    }
    await newVariable.updateValueFromPacket(data.packet)
  }

  sendVariable(variable: LoxoneVariableService) {
    if (!this.remoteSystem) return
    if (variable.value === null) return
    return this.remoteSystem
      .createOutput(variable.packetId, variable.type)
      .setValue(variable.value)
      .send()
  }

  serialize() {
    return {
      id: this.id,
      label: this.entity.label,
      host: this.entity.host,
      port: this.entity.port,
      listenPort: this.entity.listenPort,
      active: this.entity.active,
      state: this.state.current,
      ownId: this.entity.ownId,
      remoteId: this.entity.remoteId,
      variables: this.variables.serialize().entries,
      additionalInputs: this.undefinedInputs.map(v => v.serialize())
    }
  }

}

export type Props = {
  entity: LoxoneEntity
  parent: LoxoneManager
}