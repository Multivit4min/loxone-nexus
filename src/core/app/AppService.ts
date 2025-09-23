import { runSetup } from "../../setup"

export class AppService {

  private stopHandler?: Promise<() => Promise<void>>

  /**
   * starts the application
   */
  async start() {
    this.stopHandler = new Promise<() => Promise<void>>(async (fulfill) => {
      runSetup() //init functions
      const { setupContainers } = require("../../container")
      const { setupExpress } = require("../../express")
      const { stop: stopServices } = await setupContainers()
      const { close: closeExpress } = await setupExpress()

      //stop handler
      fulfill(async () => {
        await closeExpress()
        await stopServices()
      })
    })
    await this.stopHandler
  }

  /**
   * stopts the application
   */
  async stop() {
    if (!this.stopHandler) throw new Error("not started")
    console.log("awaiting callback for stop")
    const cb = await this.stopHandler
    console.log("callback stop")
    await cb()
    this.stopHandler = undefined
  }

  /**
   * restarts the application
   */
  async restart() {
    if (this.stopHandler) await this.stop()
    await this.start()
  }

}