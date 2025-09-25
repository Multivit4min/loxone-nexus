import { ActionBuilder } from "../io/ActionBuilder"
import { OutputTreeEndpoint } from "./OutputTreeEndpoint"
import { TreeBase } from "./TreeBase"

export class TreeCategory extends TreeBase<TreeCategoryProps> {

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
      category = new TreeCategory(label, this)
      this.props.children.push(category)
    }
    return category as TreeCategory
  }

  add<T extends TreeBase>(construct: TreeEndpointConstructor<T>, label: string): T {
    const endpoint = new construct(label, this)
    this.props.children.push(endpoint)
    return endpoint
  }

  async addActions(actions: ActionBuilder) {
    Object.values(actions.entries).forEach(action => {
      const label = action.label || action.id
      this.add(OutputTreeEndpoint, label)
        .comment(action.description)
        .setConfig({ label, action: action.id })
    })
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

export type TreeCategoryProps = {
  children: (TreeCategory|TreeBase)[]
}

export interface TreeEndpointConstructor<T extends TreeBase> {
  new(label: string, parent: TreeBase): T
}