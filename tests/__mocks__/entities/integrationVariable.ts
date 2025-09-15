import type { IntegrationVariableEntity } from "../../../src/drizzle/schema"

const DEFAULT_INTEGRATION_VARIABLE: IntegrationVariableEntity = {
  id: 1,
  direction: "INPUT",
  integrationId: 0,
  label: "MOCK_VARIABLE_LABEL",
  value: null,
  config: null
}

export function createIntegrationVariable(variable: Partial<IntegrationVariableEntity> = {}) {
  return {
    ...DEFAULT_INTEGRATION_VARIABLE,
    ...variable
  }
}