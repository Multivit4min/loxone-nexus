import fs from "fs"
import { join } from "path"
import { randomBytes } from "crypto"
import dotenv from "dotenv"
import { logger } from "./logger/pino"
import { NetworkInterfaceInfo, networkInterfaces } from "os"

//base configuration directory
export const dataDir = join(__dirname, "..", "data")
export const envPath = join(dataDir, ".env")
export const databasePath = join(dataDir, "database.sqlite")
export const cleanDatabasePath = join(dataDir, "..", "clean.sqlite")

const localAddress = ((fallback = "127.0.0.1") => {
  const ifaces = networkInterfaces()
  const config: NetworkInterfaceInfo[] = []
  Object.values(ifaces).forEach(iface => iface ? config.push(...iface) : undefined)
  const iface = config
    .filter(({ internal }) => !internal)
    .sort((a, b) => (a.family === "IPv4" ? 1 : -1) - (b.family === "IPv4" ? -1 : 1))[0]
  return iface ? iface.address : fallback 
})()

//default environment variables
const environment = {
  APP_NAME: {
    value: "loxone-nexus",
    comment: "https://github.com/Multivit4min/loxone-nexus"
  },
  LISTEN_PORT: {
    value: 8000,
    comment: "Web Server Listen Port"
  },
  SECRET: {
    value: randomBytes(32).toString("hex"),
    comment: "Secret which is being used for json web token"
  },
  TZ: {
    value: Intl.DateTimeFormat().resolvedOptions().timeZone,
    comment: "For a list of timezones refer to https://en.wikipedia.org/wiki/List_of_tz_database_time_zones"
  },
  LOCAL_ADDRESS: {
    value: localAddress,
    comment: "local address which is being used to display in frontend as connection information"
  },
  VITE_PROXY: {
    value: "",
    comment: "development proxy to frontend"
  }
}

export async function runSetup() {

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
      const { value, comment } = environment[key as keyof typeof environment]
      return `${key}=${value} #${comment}`
    }).join("\n")
    logger.info(`Creating default .env file at ${envPath}`)
    fs.writeFileSync(envPath, defaultEnvironment, "utf8")
  } else { //update config
    const env: any = { ...environment }
    Object.keys(environment).forEach((key) => {
      if (!(key in process.env)) return
      env[key!].value = process.env[key]
    })
    fs.writeFileSync(envPath, Object.keys(env).map((k: any) => `${k}=${env[k].value} #${env[k].comment}`).join("\n"), "utf8")

  }
  dotenv.config({ path: envPath, override: true })

}