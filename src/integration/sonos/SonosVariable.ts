import { IntegrationVariable } from "../../core/integration/variables/IntegrationVariable"
import { IntegrationVariableManager } from "../../core/integration/variables/IntegrationVariableManager"
import { SonosIntegration } from "./SonosIntegration"
import z from "zod"
import { UpdateProps } from "../../core/integration/IntegrationInstance"
import { IntegrationVariableEntity } from "../../drizzle/schema"

export class SonosVariable extends IntegrationVariable<
  z.infer<SonosIntegration["actions"]["schema"]>
> {

  constructor(entity: IntegrationVariableEntity, parent: IntegrationVariableManager) {
    super(entity, parent)
  }

  get logger() {
    return this.instance.logger
  }

  get instance() {
    const instance = this.parent.parent
    if (instance instanceof SonosIntegration) return instance
    throw new Error(`received invalid parent instance`)
  }

  async reload() {
    await this.stop()
    const entity = await this.repositories.integrationVariable.findById(this.id)
    if (!entity) throw new Error(`could not find entity with id ${this.id}`)
    this.entity = entity
    await this.start()
    return this
  }

  async update({ label, config }: UpdateProps) {
    this.entity.label = label
    this.entity.config = config
    await this.repositories.integrationVariable.update(this.entity)
    this.services.socketManager.sendIntegrationVariable(this)
  }

  async start() {}
  async stop() {}

}