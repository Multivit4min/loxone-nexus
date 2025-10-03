import z from "zod"
import { CompiledSchema, Entry } from "./abstract/Entry"
import { IntegrationVariable } from "../variables/IntegrationVariable"

export type CallbackProps<S extends z.ZodRawShape> = {
  variable: IntegrationVariable
  config: z.infer<CompiledSchema<string, S>>
  getCurrentValue: () => any
}
export type UnregisterCallback = () => Promise<any>|any
export type RegisterCallback<S extends z.ZodRawShape> = (props: CallbackProps<S>) => Promise<UnregisterCallback>|UnregisterCallback
export type CurrentValueCallback<S extends z.ZodRawShape, R = any> = (props: CallbackProps<S>) => R

export class Input<T extends string = any, S extends z.ZodRawShape = {}> extends Entry<T, S> {
  
  private currentValueCallback: CurrentValueCallback<S, Promise<any>> = async ({ variable }) => variable.value.value
  private callback: RegisterCallback<S> = () => {
    return () => {}
  }

  /** updates the zod schema */
  schema<Ext extends z.ZodRawShape>(raw: Ext) {
    this.userShape = { ...(this.userShape ?? {}), ...raw } as S & Ext
    return this as unknown as Input<T, S & Ext>
  }

  currentValue(currentValueCallback: CurrentValueCallback<S, any>) {
    this.currentValueCallback = async (props: CallbackProps<S>) => {
      return await currentValueCallback(props)
    }
    return this
  }

  register(callback: RegisterCallback<S>) {
    this.callback = callback
    return this
  }

  async handleRegister(variable: IntegrationVariable): Promise<UnregisterCallback> {
    try {
      const props: CallbackProps<S> = {
        variable,
        config: variable.config,
        getCurrentValue: async () => this.currentValueCallback(props)
      }
      const value = await this.currentValueCallback(props)
      variable.updateValue(value)
      return await this.callback(props)
    } catch (e) {
      this.parent.logger.warn(e, `failed to register handler for ${String(this.id)}`)
      return () => {}
    }
  }
}