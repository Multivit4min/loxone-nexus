import { runSetup } from "./setup"

export async function startApplication() {

  runSetup()

  const { setupContainers } = require("./container")
  const { setupExpress } = require("./express")
  
  const { stop: stopServices } = await setupContainers()
  const { close: closeExpress } = await setupExpress()


  return {
    async stop() {
      await closeExpress()
      await stopServices()
    }
  }
}