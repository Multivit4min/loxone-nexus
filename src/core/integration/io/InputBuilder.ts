import { IntegrationVariable } from "../variables/IntegrationVariable"
import { Builder } from "./abstract/Builder"
import { Input } from "./Input"

export class InputBuilder extends Builder<Input> {

  protected createEntry(id: string): Input<any, {}> {
    return new Input(id, this)
  }

  

  async updateSpecific(variables: IntegrationVariable[]) {
    try {
      const inputs = variables.filter(v => v.isInput)
      await Promise.all(
        Object.values(this.entries)
          .filter(input => input.isTiedToSpecificUpdate)
          .map(input => {
            const actions = inputs.filter(i => i.config.action === input.id)
            if (actions.length === 0) return
            return Promise.all(actions.map(async v => v.updateValue(await input.getCurrentValue(v))))
          })
      )
    } catch (e) {
      this.logger.error(e, "failed to update specifics")
    }
  }

}