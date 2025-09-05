import { RepositoryContainer } from "../../src/container"
import { IntegrationRepository } from "../../src/prisma/repositories/IntegrationRepository"
import { IntegrationVariableRepository } from "../../src/prisma/repositories/IntegrationVariableRepository"
import { LinkRepository } from "../../src/prisma/repositories/LinkRepository"
import { LoxoneRepository } from "../../src/prisma/repositories/LoxoneRepository"
import { LoxoneVariableRepository } from "../../src/prisma/repositories/LoxoneVariableRepository"
import { UserRepository } from "../../src/prisma/repositories/UserRepository"
import prisma from "./prisma"

export const repositories: RepositoryContainer = {
  integration: new IntegrationRepository(prisma),
  user: new UserRepository(prisma),
  loxone: new LoxoneRepository(prisma),
  variables: new LoxoneVariableRepository(prisma),
  integrationVariable: new IntegrationVariableRepository(prisma),
  linkRepository: new LinkRepository(prisma)
}