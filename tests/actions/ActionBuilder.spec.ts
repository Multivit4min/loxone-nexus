import { describe, expect, it, beforeEach, vi } from "vitest"
import { ActionBuilder } from "../../src/core/integration/actions/ActionBuilder"
import { logger } from "../../src/logger/pino"
import { MockIntegrationVariable } from "../__mocks__/integration/MockIntegrationVariable"
import { createIntegrationVariable } from "../__mocks__/entities/integrationVariable"

describe("ActionBuilder", () => {

  let builder!: ActionBuilder
  let variable!: MockIntegrationVariable

  beforeEach(() => {
    builder = new ActionBuilder({ logger })
    variable = new MockIntegrationVariable(
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
    expect(builder.actions["test"]).toBe(test)
    expect(builder.actions["foo"]).toBe(foo)
    expect(builder.actions["bar"]).toBe(bar)
  }, 500)
  
  it("should call the correct action", async () => {
    let called = false
    const action = builder.create("test")
    const spy = vi.spyOn(action as any, "request")
    action.execute(() => called = true)
    await builder.execute(variable)
    expect(spy).toHaveBeenCalledOnce()
    expect(called).toBe(true)
  }, 500)
})