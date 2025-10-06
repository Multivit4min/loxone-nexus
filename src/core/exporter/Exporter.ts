import z from "zod"
import { RepositoryContainer } from "../../container"
import { integrations, integrationVariables, loxone, loxoneVariables, users } from "../../drizzle/schema"
import { db } from "../../drizzle"
import { logger } from "../../logger/pino"

export class Exporter {
  
  readonly version = 1

  constructor(readonly repositories: RepositoryContainer) {

  }

  async createExport() {
    const data = await Promise.all([
      this.repositories.user.export(),
      this.repositories.loxone.export(),
      this.repositories.loxoneVariables.export(),
      this.repositories.integration.export(),
      this.repositories.integrationVariable.export(),
      this.repositories.linkRepository.export(),
    ])
    return {
      type: "drizzle-export",
      version: this.version,
      date: new Date().toISOString(),
      data: {
        user: data[0],
        loxone: data[1],
        loxoneVariables: data[2],
        integration: data[3],
        integrationVariables: data[4],
        links: data[5]
      }
    }    
  }

  import(data: ReturnType<typeof Exporter.parseSchema>) {
    switch (data.version) {
      case 1: return this.importV1(data)
      default: throw new Error(`no parser for version ${data.version}`)
    }
  }

  private importV1({ data }: z.Infer<ReturnType<typeof Exporter.schemaV1>>) {
    return db.transaction(async tx => {
      //user
      if (data.user.length > 0) {
        await tx.insert(users).values(data.user.map(u => ({
          username: u.username,
          password: u.password,
          createdAt: u.createdAt
        }))).run()
      }
      //loxone
      if (data.loxone.length > 0) {
        const loxoneInsertedIds = await tx.insert(loxone).values(data.loxone.map(l => ({
          label: l.label,
          host: l.host,
          port: l.port,
          listenPort: l.listenPort,
          active: l.active,
          ownId: l.ownId,
          remoteId: l.remoteId
        }))).returning({ id: loxone.id, label: loxone.label }).all()
        //loxone variables
        if (data.loxoneVariables.length > 0) {
          const lvs = data.loxoneVariables
            .map(lv => {
              const index = data.loxone.findIndex(i => i.id === lv.loxoneId)
              if (index < 0) {
                logger.error(data.loxone, `could not find id for loxone variable ${lv.loxoneId}`)
                throw new Error(`index for loxone variable not found`)
              }
              const newId = loxoneInsertedIds[index].id
              if (!newId || newId <= 0) {
                logger.error(loxoneInsertedIds, `could not find valid id for index ${index}`)
                throw new Error(`received invalid index`)
              }
              lv.loxoneId = newId
              return lv
            })
            await tx.insert(loxoneVariables).values(lvs.map(i => ({
              label: i.label,
              suffix: i.suffix,
              packetId: i.packetId,
              loxoneId: i.loxoneId,
              direction: i.direction,
              value: i.value,
              type: i.type,
              forced: i.forced,
              forcedValue: i.forcedValue
            })))
        }
      }
      //integration
      if (data.integration.length > 0) {
        const integrationsInsertedIds = await tx.insert(integrations).values(data.integration.map(i => ({
          label: i.label,
          type: i.type,
          config: i.config,
          store: i.store
        }))).returning({ id: integrations.id, label: integrations.label }).all()
        //integration variables
        if (data.integrationVariables.length > 0) {
          const ivs = data.integrationVariables
            .map(iv => {
              const index = data.integration.findIndex(i => i.id === iv.integrationId)
              if (index < 0) {
                logger.error(data.integration, `could not find id for integration variable ${iv.integrationId}`)
                throw new Error(`index for integrationvariable not found`)
              }
              const newId = integrationsInsertedIds[index].id
              if (!newId || newId <= 0) {
                logger.error(integrationsInsertedIds, `could not find valid id for index ${index}`)
                throw new Error(`received invalid index`)
              }
              iv.integrationId = newId
              return iv
            })
            await tx.insert(integrationVariables).values(ivs.map(i => ({
              label: i.label,
              integrationId: i.integrationId,
              direction: i.direction,
              value: i.value,
              config: i.config,
              store: i.store
            })))
        }
      }
    })
  }

  static parseSchema(data: any) {
    return z.discriminatedUnion("version", [Exporter.schemaV1()]).parse(data)
  }

  static schemaV1() {
    return z.object({
      version: z.literal(1),
      type: z.literal("drizzle-export"),
      date: z.string(),
      data: z.object({
        user: z.array(z.object({
          id: z.int().positive(),
          username: z.string().min(1),
          password: z.string().min(1),
          createdAt: z.string().min(1)
        })),
        loxone: z.array(z.object({
          id: z.int().positive(),
          active: z.boolean(),
          label: z.string(),
          host: z.string(),
          port: z.int(),
          listenPort: z.int(),
          remoteId: z.string(),
          ownId: z.string()
        })),
        loxoneVariables: z.array(z.object({
          id: z.int().positive(),
          loxoneId: z.int().positive(),
          label: z.string().optional(),
          direction: z.enum(["INPUT", "OUTPUT"]),
          packetId: z.string(),
          value: z.any(),
          suffix: z.string().optional(),
          forced: z.any(),
          forcedValue: z.any(),
          type: z.number()
        })),
        integration: z.array(z.object({
          id: z.int().positive(),
          label: z.string(),
          type: z.string(),
          config: z.any(),
          store: z.any()
        })),
        integrationVariables: z.array(z.object({
          id: z.int().positive(),
          integrationId: z.int().positive(),
          label: z.string(),
          direction: z.enum(["INPUT", "OUTPUT"]),
          value: z.any(),
          config: z.any(),
          store: z.any()
        }))
      })

    })
  }

}