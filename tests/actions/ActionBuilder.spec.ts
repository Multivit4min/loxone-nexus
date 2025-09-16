import { describe, expect, it, beforeEach, vi } from "vitest"
import { ActionBuilder } from "../../src/core/integration/io/ActionBuilder"
import { logger } from "../../src/logger/pino"
import { createIntegrationVariable } from "../__mocks__/entities/integrationVariable"
import { IntegrationVariable } from "../../src/core/integration/variables/IntegrationVariable"

describe("ActionBuilder", () => {

  let builder!: ActionBuilder
  let variable!: IntegrationVariable

  beforeEach(() => {
    builder = new ActionBuilder({ logger })
    variable = new IntegrationVariable(
      createIntegrationVariable({
        config: { "action": "test" }
      }),
      { logger } as any
    )
  }, 500)


  it("should retrieve the correct action instance", async () => {
    const test = builder.create("test")
    const foo = builder.create("foo")
    const bar = builder.create("bar")
    expect(builder.entries["test"]).toBe(test)
    expect(builder.entries["foo"]).toBe(foo)
    expect(builder.entries["bar"]).toBe(bar)
  }, 500)
  
  it("should call the correct action", async () => {
    let called = false
    const action = builder.create("test")
    const spy = vi.spyOn(action as any, "request")
    action.execute(() => called = true)
    await builder.execute(variable as any)
    expect(spy).toHaveBeenCalledOnce()
    expect(called).toBe(true)
  }, 500)
})