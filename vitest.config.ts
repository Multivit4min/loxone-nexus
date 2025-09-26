import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    coverage: {
      enabled: true,
      provider: "v8",
      include: ["src/*"],
      reporter: ["text-summary", "lcov"],
      skipFull: true
    },
  },
})