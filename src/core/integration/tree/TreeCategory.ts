import { TreeBase } from "./TreeBase"

export class TreeCategory<T extends TreeBase = any> extends TreeBase<TreeCategoryProps<T>> {

  constructor(
    label: string,
    readonly parent?: TreeBase
  ) {
    super({
      children: []
    }, parent, { label })
  }

  addCategory(label: string) {
    let category = this.props.children.find(c => c.props.label === label)
    if (!category || !(category instanceof TreeCategory)) {
      category = new TreeCategory<T>(label, this)
      this.props.children.push(category)
    }
    return category
  }

  add(construct: TreeEndpointConstructor<T>, label: string): T {
    const endpoint = new construct(label, this)
    this.props.children.push(endpoint)
    return endpoint
  }

  serialize(): Record<string, any> {
    const { children, ...props } = this.props
    return {
      id: this.getPath(),
      ...props,
      children: children.map(child => child.serialize())
    }
  }

}

export type TreeCategoryProps<T extends TreeBase> = {
  children: (TreeCategory<T>|T)[]
}

export interface TreeEndpointConstructor<T extends TreeBase> {
  new(label: string, parent: TreeBase): T
}