import { HomeAssistantSocket } from "../HomeAssistantSocket"
import { HomeAssistantCommand } from "./abstract/HomeAssistantCommand"

export type CallServiceProps = {
  domain: string
  service: string
  service_data: Record<string, any>
}

export class HomeAssistantCallServiceCommand extends HomeAssistantCommand<CallServiceProps, void> {

  constructor(socket: HomeAssistantSocket) {
    super({ type: "call_service", socket })
  }

  transformResult(res: void): void {
    return res
  }
}