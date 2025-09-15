import { runSetup } from "./setup"
import { setupContainers } from "./container"
import { setupExpress } from "./express"

export async function startApplication() {

  runSetup()
  const { stop: stopServices } = await setupContainers()
  const { close: closeExpress } = await setupExpress()


  return {
    async stop() {
      await closeExpress()
      await stopServices()
    }
  }
}