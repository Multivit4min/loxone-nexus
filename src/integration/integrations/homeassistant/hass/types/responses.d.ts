export type Responses =
  AuthenticationResponses|
  CommandResponse|
  EventResponse|
  PongResponse

export type EventResponse<T = any> = {
  id: number
  type: "event"
  event: T
}

export type CommandResponse<T = any> = CommandSuccessResponse<T> | CommandErrorResponse

export type CommandSuccessResponse<T = any> = {
  id: number
  type: "result"
  success: true
  result: T
}

export type CommandErrorResponse = {
  id: number
  type: "result"
  success: false
  error: {
    code: string
    message: string
    translation_key?: string
    translation_domain?: string
    translation_placeholders?: Record<string, any>
  }
}

export type PongResponse = {
  id: number
  type: "pong"
}

export type AuthenticationResponses = AuthRequiredResponse | AuthOkResponse | AuthInvalidResponse

export type AuthRequiredResponse = {
  type: "auth_required"
  ha_version: string
}

export type AuthOkResponse = {
  type: "auth_ok"
  ha_version: string
}

export type AuthInvalidResponse = {
  type: "auth_invalid"
  message: string
}