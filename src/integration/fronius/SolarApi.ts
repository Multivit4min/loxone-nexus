import { URL } from "url"

export class SolarApi {

  constructor(private readonly props: SolarApi.Props) {

  }

  getUrl(url: string) {
    return new URL(`${this.props.host}${url}`)
  }

  /**
   * makes a request to the inverter
   * @param url api url to request
   */
  async get(url: URL) {
    const res = await fetch(url.toString())
    if (res.status !== 200)  throw new Error(`received status code ${res.status} from solar api`)
    if ((res.headers.get("content-type")|| "").trim() !== "application/json") throw new Error(`received invalid content-type header, expected application/json but received "${res.headers.get("content-type")}"`)
    return (await res.json()).Body.Data
  }

  getInverterRealtimeData(
    deviceId: number|string|null, 
    type: "CommonInverterData"
  ): Promise<SolarApi.GetInterterRealtimeDataCommonResponse>
  getInverterRealtimeData(
    deviceId: number|string|null, 
    type: "CumulationInverterData"
  ): Promise<SolarApi.GetInterterRealtimeDataCumulationResponse>
  /**
   * retrieves realtime inverter data
   * @param deviceId 
   * @param type
   * @returns 
   */
  getInverterRealtimeData(
    deviceId: number|string|null = null, 
    type: SolarApi.DataCollection = "CommonInverterData"
  ): Promise<any> {
    const url = this.getUrl("/solar_api/v1/GetInverterRealtimeData.cgi")
    url.searchParams.append("DataCollection", type)
    if (deviceId !== null) {
      url.searchParams.append("Scope", "Device")
      url.searchParams.append("DeviceId", `${deviceId}`)
    } else {
      url.searchParams.append("Scope", "System")
    }
    return this.get(url)
  }

  /**
   * retrieves general inverter information
   */
  getInverterInfo(): Promise<SolarApi.GetInverterInfoResponse> {
    const url = this.getUrl("/solar_api/v1/GetInverterInfo.cgi")
    return this.get(url)
  }

  getPowerFlowRealtimeData(): Promise<SolarApi.GetPowerFlowRealtimeDataResponse> {
    const url = this.getUrl("/solar_api/v1/GetPowerFlowRealtimeData.fcgi")
    return this.get(url)
  }

  getActiveDeviceInfo(): Promise<SolarApi.ActiveDeviceInfoResponse> {
    const url = this.getUrl("/solar_api/v1/GetActiveDeviceInfo.cgi")
    return this.get(url)
  }

  /**
   * Get Smartmeter realtime infos
   * @param deviceId device id to retrieve
   * @returns 
   */
  getMeterRealtimeData(deviceId?: string|number): Promise<SolarApi.MeterRealtimeDataResponse> {
    const url = this.getUrl("/solar_api/v1/GetMeterRealtimeData.cgi")
    if (deviceId) {
      url.searchParams.append("Scope", "Device")
      url.searchParams.append("DeviceId", `${deviceId}`)
    } else {
      url.searchParams.append("Scope", "System")
    }
    return this.get(url)
  }

  /**
   * @deprecated
   * @returns 
   */
  getOhmpilotRealtimeData(deviceId?: string|number): Promise<SolarApi.OhmpilotRealtimeDataResponse> {
    const url = this.getUrl("/solar_api/v1/GetOhmPilotRealtimeData.cgi")
    if (deviceId) {
      url.searchParams.append("Scope", "Device")
      url.searchParams.append("DeviceId", `${deviceId}`)
    } else {
      url.searchParams.append("Scope", "System")
    }
    return this.get(url)
  }

  /**
   * 
   * @param deviceId device id to retrieve
   * @returns 
   */
  getStorageRealtimeData(deviceId?: string|number): Promise<SolarApi.StorageRealtimeDataResponse> {
    const url = this.getUrl("/solar_api/v1/GetStorageRealtimeData.cgi")
    if (deviceId) {
      url.searchParams.append("Scope", "Device")
      url.searchParams.append("DeviceId", `${deviceId}`)
    } else {
      url.searchParams.append("Scope", "System")
    }
    return this.get(url)
  }
}


export namespace SolarApi {
  export type Props = {
    host: string
  }

  export type DataCollection = "CommonInverterData"|"3PInverterData"|"CumulationInverterData"

  export type GetInverterRealtimeDataValues = {
    Unit: string
    Values: Record<string, number|null>
  }
  
  export type GetInverterRealtimeDataValue = {
    Unit: string
    Value: number|null
  }

  export type GetInterterRealtimeDataCommonResponse = {
    DAY_ENERGY: GetInverterRealtimeDataValue
    DeviceStatus: {
      ErrorCode: number
      InverterState: string
      StatusCode: number
    }
    FAC: GetInverterRealtimeDataValue
    IAC: GetInverterRealtimeDataValue
    IDC: GetInverterRealtimeDataValue
    IDC_2: GetInverterRealtimeDataValue
    IDC_3: GetInverterRealtimeDataValue
    PAC: GetInverterRealtimeDataValue
    SAC: GetInverterRealtimeDataValue
    TOTAL_ENERGY: GetInverterRealtimeDataValue
    UAC: GetInverterRealtimeDataValue
    UDC: GetInverterRealtimeDataValue
    UDC_2: GetInverterRealtimeDataValue
    UDC_3: GetInverterRealtimeDataValue
    YEAR_ENERGY: GetInverterRealtimeDataValue
  }

  export type GetInterterRealtimeDataCumulationResponse = {
    DAY_ENERGY: GetInverterRealtimeDataValues
    PAC: GetInverterRealtimeDataValues
    TOTAL_ENERGY: GetInverterRealtimeDataValues
    YEAR_ENERGY: GetInverterRealtimeDataValues
  }

  export type InverterInfo = {
    CustomName: string
    DT: number
    ErrorCode: number
    InverterState: string
    PVPower: number
    Show: number
    StatusCode: number
    UniqueID: string
  }

  export type GetInverterInfoResponse = Record<string, InverterInfo>

  export type PowerFlowInverter = {
    //device type of inverter GEN24/Tauro/Verto do report 1
    DT: number
    /**
     * Fronius GEN24/Tauro/Verto always null
     * AC Energy [Wh] this day, null if no inverter is connected
     */
    E_DAY: number|null
    /**
     * updated only every 5 minutes on GEN24/Tauro/Verto.
     * AC Energy [Wh] ever since , null if no inverter is connected
     */
    E_TOTAL: number|null
    /**
     * Fronius GEN24/Tauro/Verto always null
     * AC Energy [Wh] this year , null if no inverter is connected
     */
    E_YEAR: number|null
    /**
     * urrent power in Watt , null if not running (+ produce/export , - consume/import)
     * This is power generated on AC side (ac power output).
     */
    P: number
    /** current state of charge in % as decimal ( 5.3% ) or integer (0 - 100%) */
    SOC: number|number
    /**
     * "disabled", "normal", "service", "charge boost",
     * "nearly depleted", "suspended", "calibrate",
     * "grid support", "deplete recovery", "non operable (voltage)",
     * "non operable (temperature)", "preheating", "startup",
     * "stopped (temperature)", "battery full"
     */
    Battery_Mode: string|undefined
  }

  export type PowerFlowSecondaryMeters = {
    /**
     * "METER_CAT_WR" ... Photovoltaic inverter
     * "METER_CAT_BAT" ... AC storage unit
     * "METER_CAT_PV_BAT" ... Photovoltaic inverter + storage unit
     * "METER_CAT_WINDMILL" ... Wind turbine
     * "METER_CAT_BHKW" ... Combined heat and power station (CHP)
     * "METER_CAT_ECAR" ... Electric vehicle
     * "METER_CAT_HEATPUMP" ... Heatpump
     * "METER_CAT_OTHERHEATING" ... Other heating system
     * "METER_CAT_PUMP" ... Pump
     * "METER_CAT_WHITEGOODS" ... White goods
     * "METER_CAT_CLIMATE" ... Climate control / cooling systems
     * "METER_CAT_BUILDING" ... Building services
     * "METER_CAT_OTHER" ... Other
     */
    Category: string
    //user defined name of the device
    Label: string
    //meter location of the device
    Mloc: number
    /**
     * current power consumption/production in Watt (direction is based on meter location)
     * consumption is negative for meter location >= 256
     * production is positive for meter location 
     */
    P: number
  }

  export type PowerFlowSite = {
    /**
     * "produce-only", inverter only
     * "meter", "vague -meter", inverter and meter
     * "bidirectional" or "ac-coupled" inverter , meter and battery
     */
    Mode: string
    /**
     * field is available if configured (false) or active (true)
     * if not available , mandatory config is not set.
     * On Gen24 this flag is always available
     */
    BackupMode: boolean|undefined
    /** true when battery is in standby */
    BatteryStandby: boolean|undefined
    /* C Energy [Wh] this day, null if no inverter is connected */
    E_Day: number|null|undefined
    /** 
     * this value is always null on GEN24/Tauro/Verto
     * AC Energy [Wh] this year , null if no inverter is connected
     */
    E_Total: number|null
    /**
     * updated only every 5 minutes on GEN24/Tauro/Verto.
     * AC Energy [Wh] ever since , null if no inverter is connected
     */
    E_Year: number|null
    /** "load", "grid" or "unknown" (during backup power) */
    Meter_Location: string
    /** this value is null if no battery is active ( - charge , + discharge ) */
    P_Akku: number|null
    /** this value is null if no meter is enabled ( + from grid , - to grid ) */
    P_Grid: number
    /** #this value is null if no meter is enabled ( + generator , - consumer ) */
    P_Load: number
    /**
     * this value is null if inverter is not running ( + production ( default ) )
     * On GEN24 and SymoHybrid: reports production on DC side (PV generator).
     * On SnapInverter: is ident to power generated on AC side (ac power output).
     */
    P_PV: number|null
    /** current relative autonomy in %, null if no smart meter is connected */
    rel_Autonomy: number
    /** current relative self consumption in %, null if no smart meter is connected */
    rel_SelfConsumption: number
  }

  export type PowerFlowSmartLoadsOhmPilot = {
    /** current power consumption in Watt */
    P_AC_Total: number
    /** "normal", "min-temperature", "legionella-protection", "fault", "warning" or "boost" */
    State: string
    /** temperature of storage / tank in degree Celsius */
    Temperature: number
  }

  export type PowerFlowSmartLoads = {
    Ohmpilots?: Record<string, PowerFlowSmartLoadsOhmPilot>
  }

  export type GetPowerFlowRealtimeDataResponse = {
    Inverters: Record<string, PowerFlowInverter>
    SecondaryMeters: Record<string, PowerFlowSecondaryMeters>
    Site: PowerFlowSite
    Smartloads: PowerFlowSmartLoads
    Version: string
  }

  export type DeviceInfo = {
    DT: number
    Serial: string
  }

  export type ActiveDeviceInfoResponse = {
    Inverter: Record<string, DeviceInfo>
    Meter: Record<string, DeviceInfo>
    Ohmpilot: Record<string, DeviceInfo>
    Storage: Record<string, DeviceInfo>
  }

  export type DeviceDetails = {
    Manufacturer: string
    Model: string
    Serial: string
  }

  export type MeterRealtimeDataValue = {
    Current_AC_Phase_1: number
    Current_AC_Phase_2: number
    Current_AC_Phase_3: number
    Details: DeviceDetails
    Enable: number
    EnergyReactive_VArAC_Sum_Consumed: number
    EnergyReactive_VArAC_Sum_Produced: number
    EnergyReal_WAC_Minus_Absolute: number
    EnergyReal_WAC_Plus_Absolute: number
    EnergyReal_WAC_Sum_Consumed: number
    EnergyReal_WAC_Sum_Produced: number
    Frequency_Phase_Average: number
    Meter_Location_Current: number
    PowerApparent_S_Phase_1: number
    PowerApparent_S_Phase_2: number
    PowerApparent_S_Phase_3: number
    PowerApparent_S_Sum: number
    PowerFactor_Phase_1: number
    PowerFactor_Phase_2: number
    PowerFactor_Phase_3: number
    PowerFactor_Sum: number
    PowerReactive_Q_Phase_1: number
    PowerReactive_Q_Phase_2: number
    PowerReactive_Q_Phase_3: number
    PowerReactive_Q_Sum: number
    PowerReal_P_Phase_1: number
    PowerReal_P_Phase_2: number
    PowerReal_P_Phase_3: number
    PowerReal_P_Sum: number
    TimeStamp: number
    Visible: number
    Voltage_AC_PhaseToPhase_12: number
    Voltage_AC_PhaseToPhase_23: number
    Voltage_AC_PhaseToPhase_31: number
    Voltage_AC_Phase_1: number
    Voltage_AC_Phase_2: number
    Voltage_AC_Phase_3: number
  }

  export type MeterRealtimeDataResponse = Record<string, MeterRealtimeDataValue>

  export type OhmpilotDataValue = {

  }

  export type OhmpilotRealtimeDataResponse = Record<string, OhmpilotDataValue>

  export type StorageRealtimeDataValue = {
    Capacity_Maximum: number
    Current_DC: number
    DesignedCapacity: number
    Details: DeviceDetails
    Enable: number
    StateOfCharge_Relative: number
    Status_BatteryCell: number
    Temperature_Cell: number
    TimeStamp: number
    Voltage_DC: number
  }

  export type StorageRealtimeDataResponse = Record<string, {
    Controller: StorageRealtimeDataValue
    Modules: StorageRealtimeDataValue[]
  }>
}