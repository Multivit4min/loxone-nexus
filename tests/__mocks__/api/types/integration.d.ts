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

export type IntegrationVariableConfig = Record<string, any>

export type IntegrationVariableCreateProps<T extends IntegrationVariableConfig> = {
  //arbitary name to identify the integration
  label: string
  //type of integration
  direction: "INPUT"|"OUTPUT"
  //additional variable props
  props: T
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

export type IntegrationVariable<T extends IntegrationVariableConfig> = {
  id: number
  integrationId: number
  label: string
  direction: "INPUT"|"OUTPUT"
  value: any
  config: T
  store: any
  links: []
}

export type GetIntegrationsResponse = {
  entries: Integration[]
}