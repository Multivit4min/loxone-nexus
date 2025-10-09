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
import { createDatabaseConnection, initDatabase } from "./drizzle"
import { Exporter } from "./core/exporter/Exporter"
import { CalendarIntegration } from "./integration/calendar/CalendarIntegration"
import { AppService } from "./core/app/AppService"
import { HueIntegration } from "./integration/hue/HueIntegration"
import { WebhookIntegration } from "./integration/webhook/WebhookIntegration"
import { MqttIntegration } from "./integration/mqtt/MqttIntegration"
import { FroniusIntegration } from "./integration/fronius/FroniusIntegration"

export type ServiceContainer = {
  authService: AuthService
  userService: UserService
  socketManager: SocketManager
  integrationManager: IntegrationManager
  loxoneManager: LoxoneManager
  linkService: LinkManager
  exporter: Exporter
  appService: AppService
}

export type RepositoryContainer = {
  integration: IntegrationRepository
  user: UserRepository
  loxone: LoxoneRepository
  loxoneVariables: LoxoneVariableRepository
  integrationVariable: IntegrationVariableRepository
  linkRepository: LinkRepository
}

export let repositories: RepositoryContainer
export let services: ServiceContainer

export async function setupContainers(appService: AppService) {

  const db = createDatabaseConnection()

  repositories = {
    integration: new IntegrationRepository(db),
    user: new UserRepository(db),
    loxone: new LoxoneRepository(db),
    loxoneVariables: new LoxoneVariableRepository(db),
    integrationVariable: new IntegrationVariableRepository(db),
    linkRepository: new LinkRepository(db)
  }

  services = {
    authService: new AuthService(repositories),
    userService: new UserService(repositories),
    socketManager: new SocketManager(),
    integrationManager: new IntegrationManager(repositories),
    loxoneManager: new LoxoneManager(repositories),
    linkService: new LinkManager(repositories),
    exporter: new Exporter(repositories),
    appService
  }

  await initDatabase()
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
    .register("Calendar", CalendarIntegration)
    .register("Hue", HueIntegration)
    .register("Webhook", WebhookIntegration)
    .register("Mqtt", MqttIntegration)
    .register("Fronius", FroniusIntegration)
    .init(services)
  await services.loxoneManager.init(services)
  await services.linkService.init(services)

  return {
    async stop() {
      await Promise.all(Object.values(services).map(service => {
        if (
          "stop" in service &&
          typeof service.stop === "function" &&
          !(service instanceof AppService)
        ) return service.stop()
        return null
      }))
    }
  }
}