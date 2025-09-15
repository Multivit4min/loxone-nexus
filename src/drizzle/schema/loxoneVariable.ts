import { relations } from "drizzle-orm"
import { int, sqliteTable, text } from "drizzle-orm/sqlite-core"
import { SerializedDataType } from "../../core/conversion/VariableConverter"
import { loxone } from "./loxone"
import { links } from "./link"
import { DATA_TYPE } from "loxone-ici"

export type LoxoneVariableEntity = typeof loxoneVariables.$inferSelect

export type LoxoneVariableType = typeof LoxoneVariableTypes[number]
export const LoxoneVariableTypes = [
  "DIGITAL", "ANALOG", "TEXT", "T5",
  "SMART_ACTUATOR_RGBW",
  "SMART_ACTUATOR_SINGLE_CHANNEL",
  "SMART_ACTUATOR_TUNABLE_WHITE",
  "UNKNOWN"
] as const

export const loxoneVariables = sqliteTable("loxone_variables", {
  id: int("id").primaryKey({ autoIncrement: true }),
  loxoneId: int("loxone_id")
    .references(() => loxone.id, { onDelete: "cascade" }).notNull(),
  label: text("label"),
  direction: text("direction", { enum: ["OUTPUT", "INPUT"] }).notNull(),
  packetId: text("packet_id", { length: 8 }).notNull(),
  value: text("value", { mode: "json" }).$type<SerializedDataType>(),
  suffix: text("suffix"),
  forced: int("forced", { mode: "boolean" }).notNull().default(false),
  forcedValue: text("forced_value", { mode: "json" }).$type<SerializedDataType>(),
  type: int("type").notNull().$type<DATA_TYPE>()
})

export const loxoneVariableRelations = relations(loxoneVariables, ({ one, many }) => ({
  loxone: one(loxone, {
    fields: [loxoneVariables.loxoneId],
    references: [loxone.id]
  }),
  links: many(links)
}))