import { join } from "path"
import { drizzle } from 'drizzle-orm/libsql'
import { migrate } from "drizzle-orm/libsql/migrator"
import * as schema from "./schema"
import { DrizzleDatabaseType } from "./database"
import { Client, createClient } from "@libsql/client"

export let db: DrizzleDatabaseType
let client: Client

export const createDatabaseConnection = () => {
  const url = process.env.DATABASE_PATH
  const defaultUrl = `file:${join(process.cwd(), "data", "database.sqlite")}`
  client = createClient({ url: url ?? defaultUrl })
  db = drizzle(client, { schema })
  return db;
};

export const initDatabase = async () => {
  if (!db) createDatabaseConnection()
  const migrationsFolder = join(process.cwd(), "drizzle")
  await migrate(db, { migrationsFolder })
}

export const closeDatabaseConnection = () => {
  if (client) client.close()
}