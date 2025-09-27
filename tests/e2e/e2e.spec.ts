import { afterAll, beforeAll, describe, expect, it } from "vitest"
import { AppService } from "../../src/core/app/AppService"
import { NexusApi } from "../__mocks__/api/NexusApi"
import { ApiError } from "../__mocks__/api/ApiError"

describe("E2E Test", () => {
  
  process.env.DATABASE_PATH = "file::memory:?cache=shared"
  let api = new NexusApi("http://localhost:8000")
  let app: AppService

  beforeAll(async () => {
    app = new AppService()
    await app.start()
  })

  afterAll(async () => {
    await app.stop()
  })

  it("should test if setup is enabled", async () => {
    const { setup } = await api.apiConfig()
    expect(setup).toBe(true)
  })

  it("should register for an account via setup", async () => {
    const { user, token } = await api.setup("admin", "foo123456")
    expect(user.id).toBe(1)
    expect(user.username).toBe("admin")
    expect(token).toBeTypeOf("string")
  })

  it("should validate that the setup route is not available anymore", async () => {
    expect(api.setup("admin", "foo123456")).rejects.toThrowError(ApiError)
  })

  it("should validate a failed login attempt", async () => {
    expect(api.login("admin", "WRONG_PASSWORD")).rejects.toThrowError(ApiError)
  })

  it("should login and retrieve a token for the user", async () => {
    const { user, token } = await api.login("admin", "foo123456")
    expect(user.id).toBe(1)
    expect(user.username).toBe("admin")
    expect(token).toBeTypeOf("string")
  })

  it("should create a new user", async () => {
    const user = await api.createUser("test", "foobar")
    expect(user.id).toBe(2)
    expect(user.username).toBe("test")
    const users = await api.getUsers()
    expect(users.length).toBe(2)
  })

  it("should update a user", async () => {
    const user = await api.updateUser(2, { username: "test2" })
    expect(user.id).toBe(2)
    expect(user.username).toBe("test2")
  })

  it("should delete the user", async () => {
    await api.deleteUser(2)
    const users = await api.getUsers()
    expect(users.length).toBe(1)
  })
})