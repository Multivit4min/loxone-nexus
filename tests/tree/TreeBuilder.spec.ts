import { describe, expect, it } from "vitest"
import { TreeBuilder } from "../../src/core/integration/tree/TreeBuilder"


describe("TreeBuilder", () => {

  it("should add a category to the input", async () => {
    const tree = new TreeBuilder()
    tree.addInputCategory("input test")
    expect(tree.serialize()).toEqual([{
      id: "inputs",
      label: "inputs",
      className: "text-primary",
      children: [{
        children: [],
        id: "inputs.input test",
        label: "input test"
      }]
    }])
  })

  it("should add a category to the output", async () => {
    const tree = new TreeBuilder()
    tree.addOutputCategory("output test")
    expect(tree.serialize()).toEqual([{
      id: "outputs",
      label: "outputs",
      className: "text-primary",
      children: [{
        children: [],
        id: "outputs.output test",
        label: "output test"
      }]
    }])
  })
  
})