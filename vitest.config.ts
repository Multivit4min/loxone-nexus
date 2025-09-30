import { defineConfig } from "vitest/config"

export default defineConfig({
  ssr: {
    noExternal: ["node-hue-api"]
  },
  test: {    
    environment: "node",
    deps: {
      inline: ["node-hue-api"]
    },
    coverage: {
      enabled: true,
      provider: "v8",
      include: ["src/*"],
      reporter: ["text-summary", "lcov"],
      skipFull: true
    },
  },
})