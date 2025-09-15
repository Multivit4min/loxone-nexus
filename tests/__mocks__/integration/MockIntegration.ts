import z from "zod"
import { IntegrationInstance } from "../../../src/core/integration/IntegrationInstance"
import { IntegrationVariableManager } from "../../../src/core/integration/variables/IntegrationVariableManager"
import { IntegrationManager } from "../../../src/core/integration/IntegrationManager"
import { MockIntegrationVariable } from "./MockIntegrationVariable"
import { IntegrationEntity, IntegrationVariableEntity } from "../../../src/drizzle/schema"


export class MockIntegration extends IntegrationInstance<{}> {

  constructor(entity: IntegrationEntity, parent: IntegrationManager) {
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

  static createIntegrationVariable(v: IntegrationVariableEntity, parent: IntegrationVariableManager) {
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