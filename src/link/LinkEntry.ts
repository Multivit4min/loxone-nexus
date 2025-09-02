import { Link, VariableDirection } from "@prisma/client"
import { LinkService } from "./LinkService"
import { LoxoneVariableService } from "../loxone/variables/LoxoneVariableService"
import { IntegrationVariable } from "../integration/variables/IntegrationVariable"
import { TypeConversion } from "../util/TypeConversion"
import { logger } from "../logger"

export class LinkEntry {

  integrationId?: string
  loxoneId?: string
  receiver?: "loxone"|"integration"
  private lastValue = ""
  private loxoneVariableCache?: LoxoneVariableService
  private integrationVariableCache?: IntegrationVariable

  constructor(
    readonly entity: Link,
    readonly parent: LinkService
  ) {}

  get id() {
    return this.entity.id
  }

  get integrationVariableId() {
    return this.entity.integrationVariableId
  }

  get loxoneVariableId() {
    return this.entity.loxoneVariableId
  }

  get valid() {
    return this.integrationId && this.loxoneId
  }

  get loxoneVariable() {
    if (!this.valid) throw new Error(`invalid configuration for link ${this.id}`)
    if (!this.loxoneVariableCache) {
      const instance = this.parent.services.loxoneManager.getId(this.loxoneId!)
      const variable = instance.variables.getId(this.loxoneVariableId)
      this.loxoneVariableCache = variable
    }
    return this.loxoneVariableCache
  }

  get integrationVariable() {
    if (!this.valid) throw new Error(`invalid configuration for link ${this.id}`)
    if (!this.integrationVariableCache) {
      const integration = this.parent.services.integrationManager.getId(this.integrationId!)
      const variable = integration.variables.getId(this.integrationVariableId)
      this.integrationVariableCache = variable
    }
    return this.integrationVariableCache
  }

  async init() {
    const [intVar, loxVar] = await Promise.all([
      this.parent.repositories.integrationVariable.findById(this.integrationVariableId),
      this.parent.repositories.variables.findById(this.loxoneVariableId)
    ])
    if (!intVar || !loxVar) return this
    if (intVar.direction === VariableDirection.OUTPUT) {
      if (loxVar.direction === VariableDirection.INPUT) {
        this.lastValue = loxVar.value || ""
        this.integrationId = intVar.integrationId
        this.loxoneId = loxVar.loxoneId
        this.receiver = "integration"
      } else {
        logger.error(`Link Error! on link ${this.id}`)
      }
    } else if (intVar.direction === VariableDirection.INPUT) {
      if (loxVar.direction === VariableDirection.OUTPUT) {
        this.lastValue = intVar.value || ""
        this.integrationId = intVar.integrationId
        this.loxoneId = loxVar.loxoneId
        this.receiver = "loxone"
      } else {
        logger.error(`Link Error! on link ${this.id}`)
      }
    }
    this.receive(this.lastValue)
    return this
  }

  remove() {
    this.loxoneVariable.manager.parent.reload()
    this.integrationVariable.parent.reload()
  }

  receive(value: string) {
    if (!this.valid) return
    if (this.receiver === "loxone") {
      return this.toLoxone(value)
    } else if (this.receiver === "integration") {
      return this.toIntegration(value)
    }
  }

  private toLoxone(value: string) {
    this.loxoneVariable.updateValue(
      TypeConversion.parseLoxoneTypeFromString(this.loxoneVariable.type, value)
    )
  }

  private toIntegration(value: string) {
    this.integrationVariable.updateValue(value)
  }
}