import { beforeEach, describe, expect, it } from "vitest"
import { AuthService } from "../src/user/AuthService"
import { createUser } from "./__mocks__/entities/user"

process.env.SECRET = "vitest"

describe("AuthService", () => {

  let auth: AuthService

  beforeEach(() => {
    auth = new AuthService({} as any)
  }, 500)

  describe("jwt token", () => {
    const user = createUser()
    let token: string

    it("should sign a token", async () => {
      const res = await auth.sign(user)
      token = res.token
      expect(res.user).toStrictEqual({ id: user.id, username: user.username })
      expect(token).toBeTypeOf("string")
    }, 500)

    it("should verify the token", async () => {
      const res = await auth.verify(token)
      expect(res).toBeTypeOf("object")
      expect(res.id).toBe(user.id)
      expect(res.username).toBe(user.username)
    }, 500)
  })
  
})