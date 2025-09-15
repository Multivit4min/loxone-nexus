import type { UserEntity } from "../../../src/drizzle/schema"

const DEFAULT_USER: UserEntity = {
  id: 1,
  username: "vitest",
  password: "foo",
  createdAt: new Date().toISOString()
}

export function createUser(user: Partial<UserEntity> = {}) {
  return {
    ...DEFAULT_USER,
    ...user
  }
}