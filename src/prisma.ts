import { PrismaClient } from "@prisma/client"
import { join } from "path"
import { dataDir } from "./setup"

export let prisma: PrismaClient

export const createPrisma = () => {
  console.log("PATH", join("file://", dataDir, "dev.db"))

  prisma = new PrismaClient({
    datasources: {
      db: { url: join("file://", dataDir, "dev.db") }
    }
  })
  return prisma
}

export const closePrisma = () => {
  prisma.$disconnect()
}