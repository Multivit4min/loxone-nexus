import { Context } from "./Context"
import { State } from "./State"

export type EventType<E extends string, T = {}> = {
  event_type: E
  data: {}
  origin: string
  time_fired: string
  context: Context
}

export type EventEvents = 
  RecorderHourlyStatisticsGeneratedEvent |
  Recorder5MinStatisticsGeneratedEvent |
  AndroidZoneChangedEvent |
  StateChangedEvent |
  CallServiceEvent

export type RecorderHourlyStatisticsGeneratedEvent = EventType<"recorder_hourly_statistics_generated">
export type Recorder5MinStatisticsGeneratedEvent = EventType<"recorder_5min_statistics_generated">
export type AndroidZoneChangedEvent = EventType<"android.zone_entered"|"android.zone_exited", AndroidZoneChangedEventData>
export type StateChangedEvent = EventType<"state_changed", StateChangedEventData>
export type CallServiceEvent = EventType<"call_service", unknown> //todo
export type EntityRegistryUpdated = EventType<"entity_registry_updated", EntityRegistryUpdateEventData>

 export type AndroidZoneChangedEventData = {
  accuracy: number
  altitude: number
  bearing: number
  latitude: number
  longtitude: nunber
  provider: string
  time: number
  vertical_accuracy: number
  zone: string
  device_id: string
}

export type StateChangedEventData = {
  entity_id: string
  old_state?: State
  new_state?: State
}

export type EntityRegistryUpdateEventData = {
  action: string
  entity_id: string
  changed: Record<string, any>
}
