import { DrizzleDatabaseType } from ".."
import { eq } from "drizzle-orm"
import { loxone } from "../schema"

export type UpdateLoxoneProps = {
  id: number
} & Partial<CreateLoxoneProps>

export type CreateLoxoneProps = {
  label?: string|null
  active?: boolean|null
  host: string
  port: number
  listenPort: number
  remoteId: string
  ownId: string
}

export class LoxoneRepository {

  constructor(private readonly db: DrizzleDatabaseType) {}

  findAll() {
    return this.db.query.loxone.findMany()
  }

  findById(id: number) {
    return this.db.query.loxone
      .findFirst({ where: eq(loxone.id, id) })
  }

  create(props: CreateLoxoneProps) {
    return this.db
      .insert(loxone)
      .values(props)
      .returning()
      .then(([r]) => r)
  }

  remove(id: number) {
    return this.db
      .delete(loxone)
      .where(eq(loxone.id, id))
  }
  
  update({ id, ...props }: UpdateLoxoneProps) {
    return this.db
      .update(loxone)
      .set(props)
      .where(eq(loxone.id, id))
      .then(() => this.findById(id))
  }
}