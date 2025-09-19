import { LoxoneVariableService } from "./LoxoneVariableService"
import { LoxoneInstance } from "../LoxoneInstance"
import { InstanceManager } from "../../core/instance/InstanceManager"
import { Logger } from "pino"
import { logger } from "../../logger/pino"
import { ServiceContainer } from "../../container"
import { LoxoneVariableEntity, LoxoneVariableType } from "../../drizzle/schema"
import { DATA_TYPE } from "loxone-ici"
import { SerializedDataType } from "../../core/conversion/SerializedDataType"

export class LoxoneVariableManager extends InstanceManager<LoxoneVariableEntity, LoxoneVariableService> {

  logger: Logger

  constructor(readonly parent: LoxoneInstance) {
    super()
    this.logger = logger.child({ id: this.parent.id }, { msgPrefix: "[VariableManager] " })
  }

  async init(services: ServiceContainer) {}

  get services() {
    return this.parent.parent.services
  }

  get repositories() {
    return this.parent.parent.repositories
  }

  async create(props: LoxoneVariableEntity) {
    const entity = await this.repositories.loxoneVariables.create({
      ...props,
      packetId: props.packetId,
      loxoneId: this.parent.id,
      forced: false,
      forcedValue: null,
      value: LoxoneVariableManager.defaultValueForType(props.type)
    })
    const variable = new LoxoneVariableService(entity, this)
    this.collection.push(variable)
    this.services.socketManager.sendInstance(this.parent)
    return variable
  }

  static defaultValueForType(type: DATA_TYPE): SerializedDataType {
    switch (type) {
      case DATA_TYPE.DIGITAL: return { type: "boolean", value: false }
      case DATA_TYPE.ANALOG: return { type: "number", value: 0 }
      case DATA_TYPE.TEXT: return { type: "string", value: "" }
      case DATA_TYPE.SmartActuatorSingleChannel: return { type: "SmartActuatorSingleChannel", value: { channel: 0, fadeTime: 0 } }
      default: return { type: "null", value: null }
    }
  }

  async reload() {
    const variables = await this.parent.parent.repositories.loxoneVariables.findByInstanceId(this.parent.id)
    this.collection.set(...variables.map(v => new LoxoneVariableService(v, this)))
    this.send()
    this.parent.parent.services.socketManager.sendInstance(this.parent)
  }

  /**
   * adds one or more variablees to the manager
   * @param vars 
   * @returns 
   */
  add(...variables: LoxoneVariableService[]) {
    this.collection.push(...variables)
    return this
  }

  /** sends all variables to loxone */
  send() {
    this.collection.forEach(v => v.send())
  }

  /**
   * removes a variable by its id
   * @param id 
   * @returns 
   */
  async remove(id: number) {
    const variable = this.collection.removeBy("id", id)[0]
    await this.repositories.loxoneVariables.remove(variable.id)
    await this.parent.reload()
    this.services.linkService.receiveRemoveLoxoneVariable(variable)
    return variable
  }

  getByPacketId(packetId: string) {
    return this.collection.findBy("packetId", packetId)
  }

  getInputs() {
    return this.collection.filterBy("direction", "INPUT")
  }

  getOutputs() {
    return this.collection.filterBy("direction", "OUTPUT")
  }

}