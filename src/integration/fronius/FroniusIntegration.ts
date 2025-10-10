import z from "zod"
import { IntegrationInstance } from "../../core/integration/IntegrationInstance"
import { TreeBuilder } from "../../core/integration/tree/TreeBuilder"
import { SolarApi } from "./SolarApi"
import _ from "lodash"


export class FroniusIntegration extends IntegrationInstance<
  z.infer<ReturnType<typeof FroniusIntegration.configSchema>>
> {

  api?: SolarApi
  interval!: NodeJS.Timeout
  powerFlowRealtime?: SolarApi.GetPowerFlowRealtimeDataResponse
  meterRealtime?: SolarApi.MeterRealtimeDataResponse
  storageRealtime?: SolarApi.StorageRealtimeDataResponse


  async initialize() {
    this.inputs
      .create("read")
      .schema({
        path: z.string().min(1).describe("path to read from")
      })
      .tiedToSpecificUpdate()
      .currentValue(({ config }) => _.get(this.specificSerialize(), config.path))
  }

  private get pollInterval() {
    let interval = this.config.pollInterval
    interval
    if (interval <= 0) interval = 1
    return interval * 1000    
  }

  async start() {
    this.api = new SolarApi({ host: this.config.host })
    this.interval = setInterval(async () => {
      await this.updateRealtimeInfo()
    }, this.pollInterval)
    await this.updateRealtimeInfo()
  }

  async stop() {
    clearInterval(this.interval)
    this.api = undefined
  }

  async updateRealtimeInfo() {
    if (!this.api) return this.logger.warn("api not connected")
    try {
      const res = await Promise.all([
        this.api.getPowerFlowRealtimeData(),
        this.api.getMeterRealtimeData(),
        this.api.getStorageRealtimeData()
      ])
      this.powerFlowRealtime = res[0]
      this.meterRealtime = res[1]
      this.storageRealtime = res[2]
      this.updateSpecific()
    } catch (e) {
      this.logger.error(e, "failed to fetch realtime info")
    }
  }

  specificSerialize() {
    return {
      powerflow: this.powerFlowRealtime,
      meterRealtime: this.meterRealtime,
      storageRealtime: this.storageRealtime,
    }
  }

  static configSchema() {
    return z.object({
      host: z.url().describe("address of the fronius inverter"),
      pollInterval: z.number().positive().describe("interval in seconds to check for updates")
    })
  }
}