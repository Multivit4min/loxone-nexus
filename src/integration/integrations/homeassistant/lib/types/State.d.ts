import { Context } from "./Context"

export type State = {
  entity_id: string
  state: string
  attributes: {
    friendly_name: string
    [key: string]: any
  }
  last_changed: string
  last_reported: string
  last_updated: string
  context: Context
}