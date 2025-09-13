import z from "zod"
import { IntegrationVariable } from "../variables/IntegrationVariable"
import { ActionBuilder } from "./ActionBuilder"
import { VariableConverter } from "../../conversion/VariableConverter"

export type ActionBaseSchema<T extends string> = { action: z.ZodLiteral<T> }
export type ActionProps<T extends string, S extends z.ZodRawShape> = {
  config: z.infer<CompiledSchema<T, S>>
  value: VariableConverter
}
export type CompiledSchema<T extends string, S extends z.ZodRawShape> = z.ZodObject<ActionBaseSchema<T> & S>
export type ActionCallback<T extends string, S extends z.ZodRawShape> = (props: ActionProps<T, S>) => Promise<any>|any

export class Action<T extends string = any, S extends z.ZodRawShape = {}> {
  
  private baseSchema: z.ZodObject<ActionBaseSchema<T>>
  private userShape?: S
  private callback?: ActionCallback<T, S>
  description: string = ""

  constructor(readonly id: T, readonly parent: ActionBuilder) {
    this.baseSchema = z.object({ action: z.literal(id) })
  }

  /**
   * describes what the action does
   * @param description 
   * @returns 
   */
  describe(description: string) {
    this.description = description
    return this
  }

  /** updates the zod schema */
  schema<Ext extends z.ZodRawShape>(raw: Ext) {
    this.userShape = { ...(this.userShape ?? {}), ...raw } as S & Ext
    return this as unknown as Action<T, S & Ext>
  }

  /** retrieves the current zod schema */
  get zodSchema(): CompiledSchema<T, S> {
    if (!this.userShape) return this.baseSchema as unknown as CompiledSchema<T, S>
    return this.baseSchema.extend(this.userShape)
  }

  /** sets the callback handler for this action */
  execute(callback: ActionCallback<T, S>) {
    this.callback = callback
    return this
  }

  async request(variable: IntegrationVariable) {
    if (!this.callback) throw new Error(`no callback handler registered for action id ${this.id}`)
    try {
      await this.callback({
        config: variable.config,
        value: new VariableConverter(variable.value)
      })
      return true
    } catch (e) {
      this.parent.logger.warn(e, `failed to execute action ${this.id}`)
      return false
    }
  }

  serialize() {
    return {
      id: this.id,
      description: this.description,
      schema: z.toJSONSchema(this.zodSchema)
    }
  }


}