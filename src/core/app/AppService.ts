import { runSetup } from "../../setup"
import { setupContainers } from "../../container"
import { setupExpress } from "../../express"

export class AppService {

  private stopHandler?: Promise<() => Promise<void>>

  /**
   * starts the application
   */
  async start() {
    this.stopHandler = new Promise<() => Promise<void>>(async (fulfill) => {
      runSetup()
      const { stop: stopServices } = await setupContainers(this)
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
    const cb = await this.stopHandler
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