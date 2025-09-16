import { join } from "path"
import { dataDir } from "../setup"
import { drizzle } from 'drizzle-orm/libsql'
import * as schema from "./schema"
import { DrizzleDatabaseType } from "./database"

export let db: DrizzleDatabaseType

export const createDatabaseConnection = () => {
  db = drizzle(join("file://", dataDir, "database.sqlite"), { schema })
  return db
}

export const closeDatabaseConnection = () => {
  //?
}