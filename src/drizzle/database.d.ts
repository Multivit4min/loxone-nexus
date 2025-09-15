import * as schema from "./schema"
import { drizzle } from "drizzle-orm/libsql"

export type DrizzleDatabaseType = ReturnType<typeof drizzle<typeof schema>>