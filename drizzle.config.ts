import { defineConfig } from "drizzle-kit"
import { join } from "path"

export default defineConfig({
  dialect: "sqlite",
  schema: "./src/drizzle/schema/**.ts",
  dbCredentials: {
    url: join("file://", __dirname, "/data/", "sqlite.db")
  },
  verbose: true,
  strict: true,
})
