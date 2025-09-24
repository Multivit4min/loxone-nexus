import { TreeBase } from "./TreeBase"

export class OutputTreeEndpoint extends TreeBase<OutputTreeEndpointProps> {

  constructor(label: string, readonly parent: TreeBase) {
    super({ config: {} }, parent, { label })
  }

  setConfig(config: Record<string, any>) {
    this.props.config = config
    return this
  }

  serialize(): Record<string, any> {
    return {
      id: this.getPath(),
      ...this.props
    }
  }

}

export type OutputTreeEndpointProps = {
  config: Record<string, any>
}