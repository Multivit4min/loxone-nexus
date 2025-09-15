import { relations } from "drizzle-orm"
import { int, sqliteTable } from "drizzle-orm/sqlite-core"
import { LoxoneVariableEntity, loxoneVariables } from "./loxoneVariable"
import { IntegrationVariableEntity, integrationVariables } from "./integrationVariable"

export type LinkEntity = typeof links.$inferSelect & {
  loxoneVariable: LoxoneVariableEntity
  integrationVariable: IntegrationVariableEntity
}

export const links = sqliteTable("links", {
  id: int("id").primaryKey({ autoIncrement: true }),
  loxoneVariableId: int("loxone_variable_id")
    .references(() => loxoneVariables.id, { onDelete: "cascade" })
    .notNull(),
  integrationVariableId: int("integration_variable_id")
    .references(() => integrationVariables.id, { onDelete: "cascade" })
    .notNull(),
})

export const linkRelation = relations(links, ({ one }) => ({
  loxoneVariable: one(loxoneVariables, {
    fields: [links.loxoneVariableId],
    references: [loxoneVariables.id]
  }),
  integrationVariable: one(integrationVariables, {
    fields: [links.integrationVariableId],
    references: [integrationVariables.id]
  })
}))