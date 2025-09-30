import type { DrizzleDatabaseType } from "../database"
import { eq } from "drizzle-orm"
import { integrations } from "../schema"

export type UpdateIntegrationProps = {
  id: number
} & Partial<CreateIntegrationProps>

export type CreateIntegrationProps = {
  label?: string|null
  type: string
  config: object
  store?: object
}

export class IntegrationRepository {

  constructor(private readonly db: DrizzleDatabaseType) {}

  export() {
    return this.db.query.integrations.findMany()
  }

  findAll() {
    return this.db.query.integrations
      .findMany()
  }

  findById(id: number) {
    return this.db.query.integrations
      .findFirst({ where: eq(integrations.id, id) })
  }

  create(props: CreateIntegrationProps) {
    return this.db
      .insert(integrations)
      .values(props)
      .returning()
      .then(([r]) => r)
  }

  remove(id: number) {
    return this.db
      .delete(integrations)
      .where(eq(integrations.id, id))
  }

  update({ id, ...props }: UpdateIntegrationProps) {
    return this.db
      .update(integrations)
      .set(props)
      .where(eq(integrations.id, id))
      .then(() => this.findById(id))
  }

}