import { IntegrationManager } from "./integration/IntegrationManager"
import { IntegrationRepository } from "./prisma/repositories/IntegrationRepository"
import { HomeAssistantIntegration } from "./integration/integrations/homeassistant/HomeAssistantIntegration"
import { IntegrationVariableRepository } from "./prisma/repositories/IntegrationVariableRepository"
import { LinkRepository } from "./prisma/repositories/LinkRepository"
import { LoxoneManager } from "./loxone/LoxoneManager"
import { LoxoneRepository } from "./prisma/repositories/LoxoneRepository"
import { LoxoneVariableRepository } from "./prisma/repositories/LoxoneVariableRepository"
import { prisma } from "./prisma"
import { SocketManager } from "./realtime/SocketManager"
import { AuthService } from "./user/AuthService"
import { UserRepository } from "./prisma/repositories/UserRepository"
import { UserService } from "./user/UserService"
import { LinkService } from "./link/LinkService"
import { logger } from "./logger"
import { setupStore } from "./express/api/controllers/setup.controller"

const secret = process.env.SECRET
if (!secret) {
  logger.error("SECRET environment variable is not set. Please set it to a secure value.")
  process.exit(1)
}

export type ServiceContainer = typeof services
export type RepositoryContainer = typeof repositories

export const repositories = {
  integration: new IntegrationRepository(prisma),
  user: new UserRepository(prisma),
  loxone: new LoxoneRepository(prisma),
  variables: new LoxoneVariableRepository(prisma),
  integrationVariable: new IntegrationVariableRepository(prisma),
  linkRepository: new LinkRepository(prisma)
}

export const services = {
  authService: new AuthService(repositories, secret),
  userService: new UserService(repositories),
  socketManager: new SocketManager(),
  integrationManager: new IntegrationManager(repositories),
  loxoneManager: new LoxoneManager(repositories),
  linkService: new LinkService(repositories),
}

services.userService.init(services).then(async () => {

  const userCount = await repositories.user.count()
  if (userCount === 0) {
    logger.info("No User found, enabling setup")
    setupStore.enable = true
  }

  await services.authService.init(services)
  await services.socketManager.init(services)
  await services.integrationManager
    .register("HomeAssistant", HomeAssistantIntegration)
    .init(services)
  await services.loxoneManager.init(services)
  await services.linkService.init(services)
})