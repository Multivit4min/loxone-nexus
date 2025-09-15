import type { DrizzleDatabaseType } from "../database"
import { eq } from "drizzle-orm"
import { LinkEntity, links } from "../schema"

export type UpdateLinkProps = {
  id: number
} & Partial<CreateLinkProps>

export type CreateLinkProps = {
  integrationVariableId: number
  loxoneVariableId: number
}

export class LinkRepository {

  constructor(private readonly db: DrizzleDatabaseType) {}

  findAll() {
    return this.db.query.links
      .findMany({
        with: {
          loxoneVariable: true,
          integrationVariable: true
        }
      })
  }


  findById(id: number) {
    return this.db.query.links
      .findFirst({
        where: eq(links.id, id),
        with: {
          loxoneVariable: true,
          integrationVariable: true
        }
      })
  }

  create(props: CreateLinkProps) {
    return this.db
      .insert(links)
      .values(props)
      .returning()
      .then(([r]) => this.findById(r.id)) as Promise<LinkEntity>
  }

  remove(id: number) {
    return this.db
      .delete(links)
      .where(eq(links.id, id))
  }

}