export type HueLights = HueLight[]
export type HueLight = {
  id: number
  state: Record<string, any>
  swupdate: Record<string, any>
  type: string
  name: string
  modelid: string
  manufacturename: string
  productname: string
  capabilities: Record<string, any>
}

export type HueGroups = HueGroup[]
export type HueGroup = {
  id: number
  name: string
  lights: string[]
  sensors: string[]
  type: "Lunimarie"|"Lighsource"|"LightGroup"|"Room"|"Entertainment"|"Zone"
  state: Record<string, any>
  recycle: boolean
  action: Record<string, any>
}