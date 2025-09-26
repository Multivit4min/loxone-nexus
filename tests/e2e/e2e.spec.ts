import { afterAll, beforeAll, describe, expect, it } from "vitest"
import { AppService } from "../../src/core/app/AppService"

describe("E2E Test", () => {
  
  process.env.DATABASE_PATH = "file::memory:?cache=shared"
  let app: AppService
  let authToken: string

  beforeAll(async () => {
    app = new AppService()
    await app.start()
  })

  afterAll(async () => {
    await app.stop()
  })

  it("should test if setup is enabled", async () => {
    const res = await fetch("http://localhost:8000/api")
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.setup).toBe(true)
  })

  it("should register for an account via setup", async () => {
    const res = await fetch("http://localhost:8000/api/setup", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        username: "admin",
        password: "foo123456"
      })
    })
    expect(res.status).toBe(200)
    const { user, token } = await res.json()
    expect(user.id).toBe(1)
    expect(user.username).toBe("admin")
    expect(token).toBeTypeOf("string")
    authToken = token
  })

  it("should validate that the setup route is not available anymore", async () => {
    const res = await fetch("http://localhost:8000/api/setup", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        username: "admin",
        password: "foo123456"
      })
    })
    expect(res.status).toBe(404)
  })
})