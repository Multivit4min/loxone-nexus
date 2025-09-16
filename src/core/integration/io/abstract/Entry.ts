import z from "zod"
import { Builder } from "./Builder"

export type ActionBaseSchema<T extends string> = { action: z.ZodLiteral<T> }
export type CompiledSchema<T extends string, S extends z.ZodRawShape> = z.ZodObject<ActionBaseSchema<T> & S>

export class Entry<
  T extends string = any,
  S extends z.ZodRawShape = {}
> {
  
  protected baseSchema: z.ZodObject<ActionBaseSchema<T>>
  protected userShape?: S
  description: string = ""

  constructor(readonly id: T, readonly parent: Builder<Entry>) {
    this.baseSchema = z.object({ action: z.literal(id) })
  }

  /**
   * describes what the action does
   * @param description 
   * @returns 
   */
  describe(description: string): this {
    this.description = description
    return this
  }

  /** updates the zod schema */
  schema<Ext extends z.ZodRawShape>(raw: Ext) {
    this.userShape = { ...(this.userShape ?? {}), ...raw } as S & Ext
    return this as unknown as Entry<T, S & Ext>
  }
                
  /** retrieves the current zod schema */
  get zodSchema(): CompiledSchema<T, S> {
    if (!this.userShape) return this.baseSchema as unknown as CompiledSchema<T, S>
    return this.baseSchema.extend(this.userShape)
  }

  serialize() {
    return {
      id: this.id,
      description: this.description,
      schema: z.toJSONSchema(this.zodSchema)
    }
  }


}