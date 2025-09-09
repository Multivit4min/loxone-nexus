import { LoxoneVariable, VariableDirection, LoxoneVariableType } from "@prisma/client"
import { LoxoneIOPacket } from "loxone-ici"
import { VariableDataTypes } from "../../types/general"
import { TypeConversion } from "../../util/TypeConversion"
import { LoxoneVariableManager } from "./LoxoneVariableManager"
import { Instance } from "../../core/Instance"
import { Logger } from "pino"
import { logger } from "../../logger/pino"

export class LoxoneVariableService extends Instance<LoxoneVariable> {

  readonly logger: Logger

  constructor(
    public entity: LoxoneVariable,
    readonly manager: LoxoneVariableManager
  ) {
    super(entity, manager)
    this.logger = logger.child({ id: this.id }, { msgPrefix: "[LoxoneVariable] "})
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
    return this.entity.direction === VariableDirection.INPUT
  }

  /** true when the variable gets sent from node to loxone */
  get isOutput() {
    return this.entity.direction === VariableDirection.OUTPUT
  }

  get services() {
    return this.manager.parent.parent.services
  }

  get repositories() {
    return this.manager.parent.parent.repositories
  }

  /** current parsed value */
  get value() {
    let value = this.entity.forced ? this.entity.forcedValue : this.entity.value
    return TypeConversion.DeserializeDataType(value)
  }

  async start() {
    throw new Error("not implemented")
  }
  async stop() {
    throw new Error("not implemented")
  }

  async update(props: Partial<LoxoneVariable>) {
    await this.updateEntity(props)
    this.entity = { ...this.entity, ...props }
  }

  async reload(entity?: LoxoneVariable) {
    if (!entity) entity = await this.parent.repositories.variables.findById(this.id) || undefined
    if (!entity) throw new Error(`loxone variable with id ${this.id} not found`)
    this.entity = entity
    this.services.socketManager.sendVariable(this)
    return this
  }

  async updateEntity(props: Partial<LoxoneVariable>) {
    this.entity = { ...this.entity, ...props  }
    await this.saveEntity()
  }

  async updateValue(value: VariableDataTypes): Promise<any> {
    const str = TypeConversion.SerializeDataType(value)
    if (this.entity.value === str) return
    this.entity.value = str
    await this.saveEntity()
    if (this.isInput) this.services.linkService.sendLoxoneInput(this)
    this.send()
  }

  async updateValueFromPacket(packet: LoxoneIOPacket): Promise<any> {
    this.entity.type = TypeConversion.LoxoneDataTypeToVariableType(packet)
    return this.updateValue(packet.payload.value)
  }

  /**
   * updates the value in the database
   * and sets the correct type
  */
  private async saveEntity() {
    if (this.entity.id.length > 0) {
      await this.repositories.variables.update(this.entity.id, this.entity)
    }
    this.services.socketManager.sendVariable(this)
  }

  async force(value: any) {
    this.entity.forced = true
    this.entity.forcedValue = TypeConversion.SerializeDataType(value)
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
      value: this.value.value
     }
  }

  
  /**
   * creates a new input variable from the payload of a received packet
   */
  static createFromPacket(packet: LoxoneIOPacket, manager: LoxoneVariableManager) {
    return new LoxoneVariableService({
      id: "",
      label: "",
      direction: VariableDirection.INPUT,
      packetId: packet.packetId,
      loxoneId: manager.parent.id,
      type: LoxoneVariableType.UNKNOWN,
      value: null,
      description: null,
      suffix: null,
      forced: false,
      forcedValue: null      
    }, manager)
  }

}