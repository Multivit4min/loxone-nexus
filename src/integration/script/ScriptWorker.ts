import { ScriptIntegration } from "./ScriptIntegration"
import { Worker } from "worker_threads"
import { join } from "path"
import { MessageToMainEvent, MessageToWorkerEvent, OutputVariableUpdateEvent } from "./shared"

export type State = "INIT"|"RUNNING"|"STOPPED"

export class ScriptWorker {

  worker: Worker
  state: State = "INIT"

  constructor(readonly integration: ScriptIntegration) {
    this.worker = new Worker(join(__dirname, "vm.ts"))
    this.worker.on("error", error => {
      this.logger.error(error, "worker thread threw an error")
    })
    this.worker.on("exit", () => this.destroy())
    this.worker.on("message", (ev: MessageToMainEvent) => {
      switch (ev.type) {
        case "input:update":
          const variable = this.getInputVariableByName(ev.name)
          if (!variable) return this.logger.debug(`variable ${ev.name} does not exist`)
          variable.updateValue(ev.value)
          return
        case "log": return this.integration.addLog(ev)
        default:
          return this.logger.warn(`event type ${ev.type} not implemented`)
      }
    })
  }

  updateState(state: State) {
    this.state = state
    this.integration.updateSpecific()
  }

  get logger() {
    return this.integration.logger
  }

  run() {
    this.sendEvent({
      type: "init",
      code: this.integration.code,
      outputs: this.getVariableRecords("OUTPUT"),
    })
    this.updateState("RUNNING")
  }

  destroy() {
    this.updateState("STOPPED")
    this.worker.removeAllListeners()
    this.worker.terminate()
  }

  /**
   * updates a value within the script
   */
  updateOutput(name: string, value: any) {
    this.worker.postMessage({
      type: "output:update",
      name,
      value
    } as OutputVariableUpdateEvent)
  }

  getVariableRecords(direction: "INPUT"|"OUTPUT") {
    return Object.fromEntries(
      this.getScriptVariables(direction).map(({ config, value }) => [config.name, value.value])
    )
  }

  getScriptVariables(direction: "INPUT"|"OUTPUT") {
    return this.integration.variables.collection
      .filterBy("direction", direction)
      .filter(v => v.config.action === "script_variable")
  }

  getInputVariableByName(name: string) {
    return this.getScriptVariables("INPUT").find(({ config }) => config.name === name)
  }

  private sendEvent(ev: MessageToWorkerEvent) {
    this.worker.postMessage(ev)
  }
  
}