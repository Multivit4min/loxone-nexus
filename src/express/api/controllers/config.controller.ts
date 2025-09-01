import { Request, Response } from "express"
import { NetworkInterfaceInfo, networkInterfaces } from "os"

const localAddress = ((fallback = "127.0.0.1") => {
  const ifaces = networkInterfaces()
  const config: NetworkInterfaceInfo[] = []
  Object.values(ifaces).forEach(iface => iface ? config.push(...iface) : undefined)
  const iface = config
    .filter(({ internal }) => !internal)
    .sort((a, b) => (a.family === "IPv4" ? 1 : -1) - (b.family === "IPv4" ? -1 : 1))[0]
  return iface ? iface.address : fallback 
})()

export const configController = {
  async getConfig(req: Request, res: Response) {
    res.json({
      localAddress: process.env.LOCAL_ADDRESS || localAddress
    })
  }
}