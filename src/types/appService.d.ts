import { ServiceContainer } from "../container"

export interface IAppService {
  init(services: ServiceContainer): Promise<void>
  stop(): Promise<void>
}