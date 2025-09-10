import pino from "pino"

export const logger = pino({
  level: "debug",
  transport: { target: "pino-pretty" },
  base: { pid: false },
  redact: ["access_token", "token", "password"]
})