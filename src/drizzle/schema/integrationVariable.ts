import { relations } from "drizzle-orm"
import { int, sqliteTable, text } from "drizzle-orm/sqlite-core"
import type { SerializedDataType } from "../../core/conversion/SerializedDataType"
import { integrations } from "./integration"
import { links } from "./link"

export type IntegrationVariableEntity = typeof integrationVariables.$inferSelect

export const integrationVariables = sqliteTable("integration_variable", {
  id: int("id").primaryKey({ autoIncrement: true }),
  integrationId: int("integration_id")
    .references(() => integrations.id, { onDelete: "cascade" })
    .notNull(),
  label: text("label"),
  direction: text("direction", { enum: ["OUTPUT", "INPUT"] }).notNull(),
  value: text("value", { mode: "json" }).$type<SerializedDataType>(),
  config: text("config", { mode: "json" }).notNull(),
})

export const integrationVariableRelations = relations(integrationVariables, ({ one, many }) => ({
  integration: one(integrations, {
    fields: [integrationVariables.integrationId],
    references: [integrations.id]
  }),
  links: many(links)
}))