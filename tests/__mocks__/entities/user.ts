import { User } from "@prisma/client"

const DEFAULT_USER: User = {
  id: "1",
  username: "vitest",
  password: "foo",
  createdAt: new Date(),
  updatedAt: new Date()
}

export function createUser(user: Partial<User> = {}) {
  return {
    ...DEFAULT_USER,
    ...user
  }
}