import { IntegrationVariable as VariableEntity } from "@prisma/client"
import { MockIntegration } from "./MockIntegration"
import { UpdateProps } from "../../../src/core/integration/IntegrationInstance"
import { IntegrationVariable } from "../../../src/core/integration/variables/IntegrationVariable"
import { IntegrationVariableManager } from "../../../src/core/integration/variables/IntegrationVariableManager"

export class MockIntegrationVariable extends IntegrationVariable {

  constructor(entity: VariableEntity, parent: IntegrationVariableManager) {
    super(entity, parent)
  }

  get logger() {
    return this.instance.logger
  }

  get instance() {
    const instance = this.parent.parent
    if (instance instanceof MockIntegration) return instance
    throw new Error(`received invalid parent instance`)
  }

  async reload() {
    return this
  }

  async update(props: UpdateProps) {}

  async start() {}
  async stop() {}

}