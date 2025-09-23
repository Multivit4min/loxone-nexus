import { IntegrationManager } from "./core/integration/IntegrationManager"
import { IntegrationRepository } from "./drizzle/repositories/IntegrationRepository"
import { HomeAssistantIntegration } from "./integration/homeassistant/HomeAssistantIntegration"
import { IntegrationVariableRepository } from "./drizzle/repositories/IntegrationVariableRepository"
import { LinkRepository } from "./drizzle/repositories/LinkRepository"
import { LoxoneManager } from "./loxone/LoxoneManager"
import { LoxoneRepository } from "./drizzle/repositories/LoxoneRepository"
import { LoxoneVariableRepository } from "./drizzle/repositories/LoxoneVariableRepository"
import { SocketManager } from "./realtime/SocketManager"
import { AuthService } from "./user/AuthService"
import { UserRepository } from "./drizzle/repositories/UserRepository"
import { UserService } from "./user/UserService"
import { LinkManager } from "./core/link/LinkManager"
import { logger } from "./logger/pino"
import { setupStore } from "./express/api/controllers/setup.controller"
import { SonosIntegration } from "./integration/sonos/SonosIntegration"
import { createDatabaseConnection } from "./drizzle"
import { Exporter } from "./core/exporter/Exporter"

const db = createDatabaseConnection()

export type ServiceContainer = typeof services 
export type RepositoryContainer = typeof repositories

export const repositories = {
  integration: new IntegrationRepository(db),
  user: new UserRepository(db),
  loxone: new LoxoneRepository(db),
  loxoneVariables: new LoxoneVariableRepository(db),
  integrationVariable: new IntegrationVariableRepository(db),
  linkRepository: new LinkRepository(db)
}

export const services = {
  authService: new AuthService(repositories),
  userService: new UserService(repositories),
  socketManager: new SocketManager(),
  integrationManager: new IntegrationManager(repositories),
  loxoneManager: new LoxoneManager(repositories),
  linkService: new LinkManager(repositories),
  exporter: new Exporter(repositories)
}

export async function setupContainers() {
  await services.userService.init(services)
  const { count } = await repositories.user.count()
  if (count === 0) {
    logger.info("No User found, enabling setup")
    setupStore.enable = true
  }
  await services.authService.init(services)
  await services.socketManager.init(services)
  await services.integrationManager
    .register("HomeAssistant", HomeAssistantIntegration)
    .register("Sonos", SonosIntegration)
    .init(services)
  await services.loxoneManager.init(services)
  await services.linkService.init(services)

  return {
    async stop() {
      await Promise.all(Object.values(services).map(service => {
        if ("stop" in service && typeof service.stop === "function") return service.stop()
        return null
      }))
    }
  }
}