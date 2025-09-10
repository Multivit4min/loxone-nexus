import { HomeAssistantSocket } from "../HomeAssistantSocket"
import { HomeAssistantCommand } from "./abstract/HomeAssistantCommand"


export type HomeAssistantGetConfigResponse = {
  allowlist_external_dirs: string[]
  allowlist_external_urls: string[]
  components: string[]
  config_dir: string
  config_source: string
  country: string
  currency: string
  debug: boolean
  elevation: number
  external_url: string
  internal_url: string
  language: string
  latitude: number
  longtitude: number
  location_name: string
  radius: number
  recovery_mode: boolean
  safe_mode: boolean
  state: string
  time_zone: string
  unit_system: {
    length: string
    accumulated_precipitation: string
    area: string
    mass: string
    pressure: string
    temperature: string
    volume: string
    wind_speed: string
  },
  version: string
  whitelist_external_dirs: string[]
}


export class HomeAssistantGetConfigCommand extends HomeAssistantCommand<
  void,
  HomeAssistantGetConfigResponse
> {

  constructor(socket: HomeAssistantSocket) {
    super({
      type: "get_config",
      socket
    })
  }

  transformResult(res: any) {
    return res
  }

}