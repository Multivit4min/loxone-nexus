import fs from "fs"
import { join } from "path"
import { randomBytes } from "crypto"
import dotenv from "dotenv"
import { logger } from "./logger/pino"
import { prisma } from "./prisma"

//base configuration directory
export const dataDir = join(__dirname, "..", "data")
export const envPath = join(dataDir, ".env")

//default environment variables
const environment = {
  CONFIG_VERSION: 1,
  LISTEN_PORT: 8000,
  ICI_START_PORT: 61263,
  SECRET: randomBytes(32).toString("hex"),
  TZ: "Europe/Vienna"
}

//create data directory if it does not exist
try {
  const stat = fs.statSync(dataDir)
  if (!stat.isDirectory()) throw new Error("data path is not a directory")
} catch (err: any) {
  if (err.code === "ENOENT") {
    fs.mkdirSync(dataDir)
    logger.info(`Created data directory: ${dataDir}`)
  } else {
    logger.error(`Error creating data directory: ${err}`)
    process.exit(1)
  }
}

dotenv.config({ path: envPath, override: true })

//create .env file if it does not exist
if (!fs.existsSync(envPath)) {
  const defaultEnvironment = Object.keys(environment).map((key) => { //create config
    const value = environment[key as keyof typeof environment]
    return `${key}=${value}`
  }).join("\n")
  logger.info(`Creating default .env file at ${envPath}`)
  fs.writeFileSync(envPath, defaultEnvironment, "utf8")
} else if (parseInt(process.env.CONFIG_VERSION || "0") < environment.CONFIG_VERSION) { //update config
  const updatedEnv: any = { ...environment }
  Object.keys(environment).forEach((key) => {
    if (!(key in process.env)) return
    updatedEnv[key!] = process.env[key]
  })
  updatedEnv.CONFIG_VERSION = environment.CONFIG_VERSION
  logger.info(`Updating .env file at ${envPath}`)
  fs.writeFileSync(envPath, Object.keys(updatedEnv).map((k: any) => `${k}=${updatedEnv[k]}`).join("\n"), "utf8")

}
dotenv.config({ path: envPath, override: true })
