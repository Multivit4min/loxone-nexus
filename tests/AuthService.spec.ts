import { beforeEach, describe, expect, it } from "vitest"
import { AuthService } from "../src/user/AuthService"
import { repositories } from "./__mocks__/repositories"
import prisma from "./__mocks__/prisma"
import { User } from "@prisma/client"
import { createUser } from "./__mocks__/user"

const secret = "vitest"

describe("AuthService", () => {

  let auth: AuthService

  beforeEach(() => {
    auth = new AuthService(repositories, secret)
  })

  describe("jwt token", () => {
    const user = createUser()
    let token: string

    it("should sign a token", async () => {
      const res = await auth.sign(user)
      token = res.token
      expect(res.user).toStrictEqual({ id: user.id, username: user.username })
      expect(token).toBeTypeOf("string")
    })
    it("should verify the token", async () => {
      const res = await auth.verify(token)
      expect(res).toBeTypeOf("object")
      expect(res.id).toBe(user.id)
      expect(res.username).toBe(user.username)
    })
  })
  
})