export type LoxoneInstanceCreateProps = {
  //arbitary name to identify the instance
  label: string
  //address of the loxone miniserver
  host: string
  //ici port of the miniserver (61263 by default)
  port: number
  //port on which loxone-nexus should receive data (61263 by default)
  listenPort: number
  //id to identify the miniserver
  remoteId: string
  //id to identify loxone-nexus
  ownId: string
}

export type LoxoneInstanceUpdateProps = Partial<LoxoneInstanceCreateProps>

export type LoxoneInstancesResponse = {
  schema: Record<string, any>
  entries: LoxoneInstance[]
}

export type LoxoneInstance = {
  id: number
  label: string
  host: string
  port: number
  listenPort: number
  active: boolean
  state: number
  ownId: string
  remoteId: string
  variables: LoxoneVariable[]
  additionalInputs: LoxoneVariable[]

}

export type LoxoneInstanceVariableCreateProps = {
  packetId: string
  direction: "INPUT"|"OUTPUT"
  /**
   * 0 = DIGITAL
   * 1 = ANALOG
   * 2 = TEXT
   * 3 = T5
   * 4 = SmartActuatorRGBW
   * 5 = SmartActuatorSingleChannel
   * 6 = SmartActuatorTunableWhite
   */
  type: number
  label?: string
  suffix?: string
  description?: string
}

export type LoxoneInstanceVariableUpdateProps = {
  label?: string
  suffix?: string
  description?: string
}

export type LoxoneVariable = {
  id: number
  loxoneId: number
  label: string|null
  direction: "INPUT"|"OUTPUT"
  packetId: string
  value: any
  suffix: string|null
  forced: boolean
  forcedValue: any
  type: number
  links: any[]
}