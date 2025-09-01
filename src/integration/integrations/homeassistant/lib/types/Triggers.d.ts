export type TriggerOptions = TriggerStateOption | TriggerTimeOption | TriggerEventOption

export type TriggerStateOption = {
  platform: "state"
  entity_id: string
  from?: string
  to?: string
}

export type TriggerTimeOption = {
  platform: "time"
  at: string
}

export type TriggerEventOption = {
  platform: "event"
  event_type: string
  event_data: Record<string, any>
}


export type TriggerEvent = StateTriggerEvent

export type StateTriggerEvent = {
  variables: {
    trigger: {
      id: string
      idx: number
      alias: string|null
      platform: "state"
      entity_id: string
      from_state: State
      to_state?: State
      for: any
      attribute: any
      description: string
    }
    context: Context
  }
}
