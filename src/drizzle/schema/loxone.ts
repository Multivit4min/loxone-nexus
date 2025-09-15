import { relations } from "drizzle-orm"
import { int, sqliteTable, text } from "drizzle-orm/sqlite-core"
import { loxoneVariables } from "./loxoneVariable"

export type LoxoneEntity = typeof loxone.$inferSelect

export const loxone = sqliteTable("loxone", {
  id: int("id").primaryKey({ autoIncrement: true }),
  active: int("active", { mode: "boolean" }).default(false),
  label: text("label"),
  host: text("host").notNull(),
  port: int("port").notNull(),
  listenPort: int("listen_port").notNull(),
  remoteId: text("remote_id", { length: 8 }).notNull(),
  ownId: text("own_id", { length: 8 }).notNull()
})

export const loxoneRelations = relations(loxone, ({ many }) => ({
  variables: many(loxoneVariables)
}))