import { createContext, Script } from "node:vm"
import { parentPort, isMainThread } from "node:worker_threads"
import type { InputVariableUpdateEvent, LogEvent, MessageToWorkerEvent } from "./shared"
import crypto from "crypto"
import EventEmitter from "node:events"

if (isMainThread || !parentPort) {
  console.error("this script is not inteneded to run as main thread")
  process.exit(1)
}

const sendLog = (log: LogEvent) => {
  parentPort!.postMessage(log)
}

const logger = (level: string) => {
  return (...args: any[]) => {
    if (args.some(arg => typeof arg === "string" && arg.includes("MODULE_TYPELESS_PACKAGE_JSON"))) return
    const msg = args.map(arg => {
      if (typeof arg === "object") {
        if (arg === null) return "null"
        if (
          "constructor" in arg &&
          arg.constructor.name.includes("Error") &&
          "stack" in arg
        ) return arg.stack || arg.message
        try {
          return JSON.stringify(arg, null, 2)
        } catch {
          return "[Circular]"
        }
      } else if (typeof arg === "string") {
        return `"${arg.replace(/"/g, '\\"')}"`
      } else {
        return String(arg)
      }
    })
    sendLog({ type: "log", date: new Date().toISOString(), level, msg })
  }
}

const log = console.log

console.log = logger("log")
console.error = logger("error")
console.warn = logger("warn")
console.info = logger("info")
console.debug = logger("debug")

const simpleRateLimit = (duration: number) => {
  let isLimited = false
  let lastCallback: (() => any)|undefined = undefined
  return (cb: () => any) => {
    lastCallback = cb
    if (isLimited) return
    isLimited = true
    setTimeout(() => {
      isLimited = false
      if (lastCallback) lastCallback()
    }, duration)
  }
}


const eventEmitter = new EventEmitter()
let outputs: Record<string, any> = {}

const rateLimits: Record<string, any> = {}

const whitelistedModules: string[] = [
  "net", "crypto"
]

const context = createContext({
  require: (module: string) => {
    if (!whitelistedModules.includes(module))
      throw new Error(`${module} is not allowed to be imported`)
    return require(module)
  },
  nexus: {
    set(name: string, value: any) {
      if (!(name in rateLimits)) rateLimits[name] = simpleRateLimit(100)
      rateLimits[name](() => {
        parentPort!.postMessage({ type: "input:update", name, value } as InputVariableUpdateEvent)
      })
    },
    get(name: string) {
      return outputs[name]
    },
    on: eventEmitter.on.bind(eventEmitter),
  },
  console,
  setTimeout,
  setInterval,
  clearTimeout,
  clearInterval,
  setImmediate,
  clearImmediate,
  URL,
  fetch,
  TextEncoder,
  TextDecoder,
  atob,
  btoa,
  crypto,
  Buffer
})


parentPort.on("message", async (ev: MessageToWorkerEvent) => {
  if (ev.type === "init") {
    outputs = ev.outputs
    const script = new Script(ev.code)
    try {
      await script.runInContext(context)
    } catch (e: any) {
      console.error(e)
      process.exit(1)
    }
    process.exit(0)
  } else if (ev.type === "output:update") {
    outputs[ev.name] = ev.value
    eventEmitter.emit(ev.name, ev.value)
  }
})