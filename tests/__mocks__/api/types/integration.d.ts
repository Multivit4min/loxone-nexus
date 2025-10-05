export type IntegrationConfig = Record<string, any>

export type IntegrationCreateProps<T extends IntegrationConfig> = {
  //arbitary name to identify the integration
  label: string
  //type of integration
  type: string
} & T

export type IntegrationUpdateProps<T extends IntegrationConfig> = {
  //arbitary name to identify the integration
  label: string
  config: T
}


export type Integration<T extends IntegrationConfig = any, S = any> = {
  id: number
  label: string
  type: string
  actions: []
  config: T
  configSchema: any
  inputVariableSchema: any
  outputVariableSchema: any
  specific: S
  store: any
  variables: IntegrationVariable[]
}

export type IntegrationVariable = {
  id: number
  integrationId: number
  label: string
}

export type GetIntegrationsResponse = {
  entries: Integration[]
}