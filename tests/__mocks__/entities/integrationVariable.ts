import { IntegrationVariable, VariableDirection } from "@prisma/client"

const DEFAULT_INTEGRATION_VARIABLE: IntegrationVariable = {
  id: "1",
  direction: VariableDirection.INPUT,
  integrationId: "0",
  label: "MOCK_VARIABLE_LABEL",
  value: null,
  version: 1,
  config: null
}

export function createIntegrationVariable(variable: Partial<IntegrationVariable> = {}) {
  return {
    ...DEFAULT_INTEGRATION_VARIABLE,
    ...variable
  }
}