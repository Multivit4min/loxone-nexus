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