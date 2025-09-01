import { HaosCommander } from "../HaosCommander"
import { HaosCommand } from "./HaosCommand"

export class GetConfigCommand extends HaosCommand<GetConfigCommand.Payload, GetConfigCommand.Response> {

  readonly type = "get_config"

  constructor(parent: HaosCommander) {
    super(parent, { minHAState: HaosCommander.State.WAITING_FOR_HA_READY })
  }

  async handleResponse(
    res: Record<string, any>,
    resolve: (data?: any) => void,
    reject: (err: Error) => void
  ) {
    if (res.success) {
      resolve(res.result)
    } else {
      reject(new Error(res.error.message))
    }
  }

}

export namespace GetConfigCommand {

  export type Payload = {
    type: "get_config"
  }

  export type Response = {
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

}