import z from "zod"
import { IntegrationVariable } from "../variables/IntegrationVariable"
import { VariableConverter } from "../../conversion/VariableConverter"
import { CompiledSchema, Entry } from "./abstract/Entry"

export type ActionProps<S extends z.ZodRawShape> = {
  variable: IntegrationVariable
  config: z.infer<CompiledSchema<string, S>>
  value: VariableConverter
}
export type ActionCallback<S extends z.ZodRawShape> = (props: ActionProps<S>) => Promise<any>|any

export class Action<
  T extends string = any,
  S extends z.ZodRawShape = {}
> extends Entry<T, S> {
  
  private callback: ActionCallback<S> = () => {
    throw new Error("no callback defined")
  }

  /** updates the zod schema */
  schema<Ext extends z.ZodRawShape>(raw: Ext) {
    this.userShape = { ...(this.userShape ?? {}), ...raw } as S & Ext
    return this as unknown as Action<T, S & Ext>
  }

  /** sets the callback handler for this action */
  execute(callback: ActionCallback<S>) {
    this.callback = callback
    return this
  }

  async request(variable: IntegrationVariable) {
    try {
      await this.callback({
        variable,
        config: variable.config,
        value: new VariableConverter(variable.value)
      })
    } catch (e) {
      this.parent.logger.error(e, `failed to execute action ${String(this.id)}`)
      return e
    }
  }

}