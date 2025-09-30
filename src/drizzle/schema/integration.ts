import { relations } from "drizzle-orm"
import { int, sqliteTable, text } from "drizzle-orm/sqlite-core"
import { integrationVariables } from "./integrationVariable"

export type IntegrationEntity = typeof integrations.$inferSelect

export const integrations = sqliteTable("integrations", {
  id: int("id").primaryKey({ autoIncrement: true }),
  label: text("label"),
  type: text("type").notNull(),
  config: text("config", { mode: "json" }).$type<any>(),
  store: text("store", { mode: "json" }).$type<Record<string, any>>().default({}).notNull()
})

export const integrationRelations = relations(integrations, ({ many }) => ({
  variables: many(integrationVariables)
}))