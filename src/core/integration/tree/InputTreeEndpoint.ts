import { TreeBase } from "./TreeBase"

export class InputTreeEndpoint extends TreeBase<InputTreeEndpointProps> {

  constructor(label: string, readonly parent: TreeBase) {
    super({
      value: undefined,
      config: {}
    }, parent, { label })
  }

  setValue(value: string|number|boolean) {
    this.props.value = value
    return this
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

export type InputTreeEndpointProps = {
  value?: string|number|boolean
  config: Record<string, any>
}