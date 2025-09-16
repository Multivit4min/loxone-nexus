import { LoxoneIOPacket } from "loxone-ici"
import { VariableDataTypes } from "../../types/general"
import { LoxoneVariableManager } from "./LoxoneVariableManager"
import { Instance } from "../../core/instance/Instance"
import { Logger } from "pino"
import { logger } from "../../logger/pino"
import { LoxoneVariableEntity } from "../../drizzle/schema"
import { VariableConverter } from "../../core/conversion/VariableConverter"

export class LoxoneVariableService extends Instance<LoxoneVariableEntity> {

  readonly logger: Logger

  constructor(public entity: LoxoneVariableEntity, readonly manager: LoxoneVariableManager) {
    super(entity, manager)
    this.logger = logger.child({ id: this.id }, { msgPrefix: "[LoxoneVariable] "})
  }

  get converter() {
    return new VariableConverter(this.entity.forced ? this.entity.forcedValue : this.entity.value)
  }

  get id() {
    return this.entity.id
  }

  /** packetId from the inputvariable */
  get packetId() {
    return this.entity.packetId
  }

  get type() {
    return this.entity.type
  }

  /** true when the variable gets sent from loxone to node */
  get isInput() {
    return this.entity.direction === "INPUT"
  }

  /** true when the variable gets sent from node to loxone */
  get isOutput() {
    return this.entity.direction === "OUTPUT"
  }

  get services() {
    return this.manager.parent.parent.services
  }

  get repositories() {
    return this.manager.parent.parent.repositories
  }

  /** current parsed value */
  get value() {
    return this.converter.toLoxoneType(this.type)
  }

  async start() {
    throw new Error("not implemented")
  }
  async stop() {
    throw new Error("not implemented")
  }

  async update(props: Partial<LoxoneVariableEntity>) {
    await this.updateEntity(props)
    this.entity = { ...this.entity, ...props }
  }

  async reload(entity?: LoxoneVariableEntity) {
    if (!entity) entity = await this.parent.repositories.loxoneVariables.findById(this.id) || undefined
    if (!entity) throw new Error(`loxone variable with id ${this.id} not found`)
    this.entity = entity
    this.services.socketManager.sendVariable(this)
    return this
  }

  async updateEntity(props: Partial<LoxoneVariableEntity>) {
    this.entity = { ...this.entity, ...props  }
    await this.saveEntity()
  }

  async updateValue(value: VariableDataTypes): Promise<any> {
    const str = VariableConverter.SerializeDataType(value)
    if (this.entity.value === str) return
    this.entity.value = str
    await this.saveEntity()
    if (this.isInput) this.services.linkService.sendLoxoneInput(this)
    this.send()
  }

  async updateValueFromPacket(packet: LoxoneIOPacket): Promise<any> {
    this.entity.type = packet.dataType
    return this.updateValue(packet.payload.value)
  }

  /**
   * updates the value in the database
   * and sets the correct type
  */
  private async saveEntity() {
    if (this.entity.id > 0) {
      await this.repositories.loxoneVariables.update(this.entity)
    }
    this.services.socketManager.sendVariable(this)
  }

  async force(value: any) {
    this.entity.forced = true
    this.entity.forcedValue = VariableConverter.SerializeDataType(value)
    await this.saveEntity()
    this.send()
  }

  async unforce() {
    this.entity.forced = false
    this.entity.forcedValue = null
    await this.saveEntity()
    this.send()
  }

  send() {
    if (!this.isOutput) return
    this.manager.parent.sendVariable(this)
  }

  serialize() {
    return {
      ...this.entity,
      value: this.value
     }
  }

  
  /**
   * creates a new input variable from the payload of a received packet
   */
  static createFromPacket(packet: LoxoneIOPacket, manager: LoxoneVariableManager) {
    return new LoxoneVariableService({
      id: 0,
      label: "",
      direction: "INPUT",
      packetId: packet.packetId,
      loxoneId: manager.parent.id,
      type: packet.dataType,
      value: null,
      suffix: null,
      forced: false,
      forcedValue: null      
    }, manager)
  }

}