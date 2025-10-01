import z from "zod"
import { IntegrationInstance } from "../../../src/core/integration/IntegrationInstance"
import { IntegrationVariableManager } from "../../../src/core/integration/variables/IntegrationVariableManager"
import { IntegrationManager } from "../../../src/core/integration/IntegrationManager"
import { IntegrationEntity, IntegrationVariableEntity } from "../../../src/drizzle/schema"
import { IntegrationVariable } from "../../../src/core/integration/variables/IntegrationVariable"


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

  specificSerialize() {
    return null
  }

  async tree() {
    return []
  }

  static createIntegrationVariable(v: IntegrationVariableEntity, parent: IntegrationVariableManager) {
    return new IntegrationVariable(v, parent)
  }

  static getVariableSchema() {
    return z.object({})
  }

  static configSchema() {
    return z.object({})
  }
}

export type HomeAssistantDataSourceConfig = {
  ws: string
  token: string
}