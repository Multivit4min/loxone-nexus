export type Users = User[]

export type User = {
  id: number
  username: string
  createdAt: string
}

export type UpdateUserProps = {
  username?: string
  password?: string
}