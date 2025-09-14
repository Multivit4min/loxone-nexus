import z from "zod"
import { Integration, IntegrationVariable as VariableEntity } from "@prisma/client"
import { IntegrationInstance } from "../../../src/core/integration/IntegrationInstance"
import { IntegrationVariableManager } from "../../../src/core/integration/variables/IntegrationVariableManager"
import { IntegrationManager } from "../../../src/core/integration/IntegrationManager"
import { MockIntegrationVariable } from "./MockIntegrationVariable"


export class MockIntegration extends IntegrationInstance<{}> {

  constructor(entity: Integration, parent: IntegrationManager) {
    super(entity, parent, MockIntegration)
  }

  getConstructor() {
    return MockIntegration
  }

  async start() {
    
  }

  async stop() {
    
  }

  async getInternalVariables() {
    
  }

  specificSerialize() {
    return null
  }

  static createIntegrationVariable(v: VariableEntity, parent: IntegrationVariableManager) {
    return new MockIntegrationVariable(v, parent)
  }

  static configSchema() {
    return z.object({})
  }
}

export type HomeAssistantDataSourceConfig = {
  ws: string
  token: string
}