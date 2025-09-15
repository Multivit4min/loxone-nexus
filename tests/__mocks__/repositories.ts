import type { RepositoryContainer } from "../../src/container"
import { IntegrationRepository } from "../../src/drizzle/repositories/IntegrationRepository"
import { IntegrationVariableRepository } from "../../src/drizzle/repositories/IntegrationVariableRepository"
import { LinkRepository } from "../../src/drizzle/repositories/LinkRepository"
import { LoxoneRepository } from "../../src/drizzle/repositories/LoxoneRepository"
import { LoxoneVariableRepository } from "../../src/drizzle/repositories/LoxoneVariableRepository"
import { UserRepository } from "../../src/drizzle/repositories/UserRepository"
import db from "./drizzle"

export const repositories: RepositoryContainer = {
  integration: new IntegrationRepository(db),
  user: new UserRepository(db),
  loxone: new LoxoneRepository(db),
  variables: new LoxoneVariableRepository(db),
  integrationVariable: new IntegrationVariableRepository(db),
  linkRepository: new LinkRepository(db)
}