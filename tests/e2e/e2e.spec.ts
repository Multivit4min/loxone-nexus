import { afterAll, beforeAll, describe, expect, it } from "vitest"
import { AppService } from "../../src/core/app/AppService"

describe("E2E Test", () => {
  
  process.env.DATABASE_PATH = "file::memory:?cache=shared"
  let app: AppService

  beforeAll(async () => {
    app = new AppService()
    await app.start()
  })

  afterAll(async () => {
    await app.stop()
  })

  it("should test runtime", async () => {
    expect(true).toBe(true)
  })
})