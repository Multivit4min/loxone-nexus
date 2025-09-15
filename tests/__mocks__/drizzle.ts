import { drizzle } from "drizzle-orm/libsql"
import { beforeEach } from "vitest"
import { mockDeep, mockReset } from "vitest-mock-extended"
import { createClient } from "@libsql/client"
import * as schema from "../../src/drizzle/schema"

const client = createClient({ url: "file::memory:?cache=shared" })

beforeEach(() => {
  mockReset(drizzle)
})

const db = mockDeep(drizzle(client, { schema }) as any)
export default db