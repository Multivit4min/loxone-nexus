import { TreeCategory } from "./TreeCategory"

export class TreeBuilder {
  
  readonly inputs = new TreeCategory("inputs")
  readonly outputs = new TreeCategory("outputs")

  constructor() {
    this.inputs.className("text-primary")
    this.outputs.className("text-primary")
  }

  addInputCategory(label: string) {
    return this.inputs.addCategory(label)
  }

  addOutputCategory(label: string) {
    return this.outputs.addCategory(label)
  }

  serialize() {
    const res = []
    if (this.inputs.props.children.length > 0) res.push(this.inputs.serialize())
    if (this.outputs.props.children.length > 0) res.push(this.outputs.serialize())
    return JSON.parse(JSON.stringify(res))
  }

}