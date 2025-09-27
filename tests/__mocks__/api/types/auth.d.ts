export type AuthUser = {
  id: number
  username: string
}

export type AuthToken = string

export type LoginResponse = {
  user: AuthUser
  token: AuthToken
}

export type WhoAmIResponse = {
  user: AuthUser
}