import { Builder } from "./abstract/Builder"
import { Input } from "./Input"

export class InputBuilder extends Builder<Input> {

  protected createEntry(id: string): Input<any, {}> {
    return new Input(id, this)
  }

}