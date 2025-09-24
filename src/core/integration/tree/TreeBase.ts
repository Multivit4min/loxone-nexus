export abstract class TreeBase<T extends {} = {}> {

  readonly props: TreeBaseProps & T

  constructor(props: T, readonly parent?: TreeBase, defaults: Partial<TreeBaseProps & T> = {}) {
    this.props = {
      label: "NO_LABEL_SET",
      comment: undefined,
      icon: undefined,
      bold: undefined,
      disabled: undefined,
      className: undefined,
      ...props,
      ...defaults
    }
  }

  getPath(path: string[] = [], node: TreeBase = this): string {
    path.unshift(node.props.label)
    if (!node.parent) return path.join(".")
    return node.getPath(path, node.parent)
  }

  comment(comment: string) {
    this.props.comment = comment
    return this
  }

  className(className: string) {
    this.props.className = className
    return this
  }

  icon(icon: string) {
    this.props.icon = icon
    return this
  }

  bold(bold = true) {
    this.props.bold = bold
    return this
  }

  disabled(disable = true) {
    this.props.disabled = disable
    return this
  }

  abstract serialize(): Record<string, any>

}

export type TreeBaseProps = {
  label: string
  comment?: string
  className?: string
  icon?: string
  bold?: boolean
  disabled?: boolean
}