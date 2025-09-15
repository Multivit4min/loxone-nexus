import { sql } from "drizzle-orm"
import { int, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core"

export type UserEntity = typeof users.$inferSelect

export const users = sqliteTable("user", {
  id: int().primaryKey({ autoIncrement: true }),
  username: text("username").unique().notNull(),
  password: text("password").notNull(),  
  createdAt: text("updated_at").notNull().default(sql`(CURRENT_TIMESTAMP)`)
}, table => [uniqueIndex("username_idx").on(table.username)])
