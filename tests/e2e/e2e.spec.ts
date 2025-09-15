import { afterAll, beforeAll, describe, it } from "vitest"
import { startApplication } from "../../src/app"

process.env.DATA_DIR = "/tests/data"

describe("E2E", () => {

  let stop: () => Promise<any>

  beforeAll(async () => {
    stop = (await startApplication()).stop
  })

  afterAll(async () => {
    await stop()
  })

  it("should retrieve the correct action instance", async () => {
    
  })
})