import type { DrizzleDatabaseType } from "../database"
import { eq } from "drizzle-orm"
import { integrationVariables, links } from "../schema"
import { SerializedDataType } from "../../core/conversion/SerializedDataType"

export type UpdateIntegrationVariableProps = {
  id: number
} & Partial<CreateIntegrationVariableProps>

export type CreateIntegrationVariableProps = {
  label?: string|null
  integrationId: number
  direction: "INPUT"|"OUTPUT"
  value?: SerializedDataType|null
  config: any
}

export class IntegrationVariableRepository {

  constructor(private readonly db: DrizzleDatabaseType) {}

  findAll() {
    return this.db.query.integrationVariables
      .findMany()
  }

  findById(id: number) {
    return this.db.query.integrationVariables
      .findFirst({
        where: eq(integrationVariables.id, id),
        with: { links: true }
      })
  }

  findByIntegrationId(integrationId: number) {
    return this.db.query.integrationVariables
      .findMany({
        where: eq(integrationVariables.integrationId, integrationId),
        with: { links: true }
      })
  }
  
  findLinkableById(id: number) {
    return this.db.query.integrationVariables
      .findFirst({
        where: (t, { eq }) => eq(t.id, id),
        with: { links: true }
      })
  }
  
  create(props: CreateIntegrationVariableProps) {
    return this.db
      .insert(integrationVariables)
      .values(props)
      .returning()
      .then(([r]) => ({ ...r, links: [] }))
  }

  remove(id: number) {
    return this.db
      .delete(integrationVariables)
      .where(eq(integrationVariables.id, id))
  }

  update({ id, ...props }: UpdateIntegrationVariableProps) {
    return this.db
      .update(integrationVariables)
      .set(props)
      .where(eq(integrationVariables.id, id))
      .then(() => this.findById(id))
  }

}