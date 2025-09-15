import type { DrizzleDatabaseType } from "../database"
import { eq } from "drizzle-orm"
import { loxoneVariables } from "../schema"
import { SerializedDataType } from "../../core/conversion/SerializedDataType"
import { DATA_TYPE } from "loxone-ici"

export type UpdateLoxoneVariableProps = {
  id: number
} & Partial<CreateLoxoneVariableProps>

export type CreateLoxoneVariableProps = {
  loxoneId: number
  label?: string|null
  packetId: string
  direction: "INPUT"|"OUTPUT"
  value?: SerializedDataType|null
  suffix?: string|null
  type: DATA_TYPE
  forcedValue?: SerializedDataType|null
  forced?: boolean
}

export class LoxoneVariableRepository {

  constructor(private readonly db: DrizzleDatabaseType) {}

  findAll() {
    return this.db.query.loxoneVariables
      .findMany({
        with: { links: true }
      })
  }

  findById(id: number) {
    return this.db.query.loxoneVariables
      .findFirst({
        where: eq(loxoneVariables.id, id),
        with: { links: true }
      })
  }

  findByInstanceId(loxoneId: number) {
    return this.db.query.loxoneVariables
      .findMany({
        where: eq(loxoneVariables.loxoneId, loxoneId),
        with: { links: true }
      })
  }
  
  findLinkableById(id: number) {
    return this.db.query.loxoneVariables
      .findFirst({
        where: (t, { eq }) => eq(t.id, id),
        with: { links: true }
      })
  }
    
  create(props: CreateLoxoneVariableProps) {
    return this.db
      .insert(loxoneVariables)
      .values(props)
      .returning()
      .then(([r]) => ({ ...r, links: [] }))
  }
  
  remove(id: number) {
    return this.db
      .delete(loxoneVariables)
      .where(eq(loxoneVariables.id, id))
  }
  
  update({ id, ...props }: UpdateLoxoneVariableProps) {
    return this.db
      .update(loxoneVariables)
      .set(props)
      .where(eq(loxoneVariables.id, id))
  }

}