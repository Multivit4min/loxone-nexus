import { Events } from "./Events"

export type Response<T> = ResponseOk<T> | EventResponse | ResponseError | AuthResponse

export type AuthResponse = {
  type: "auth_ok"|"auth_required"|"auth_invalid"
  ha_version: string
}

export type ResponseOk<T> = {
  type: "result"
  id: number
  success: true
  result: T
}

export type EventResponse = {
  type: "event"
  id: number
  event: Events
}

export type ResponseError = {
  type: "result"
  id: number
  success: false
  error: {
    code: string
    message: string
  }
}