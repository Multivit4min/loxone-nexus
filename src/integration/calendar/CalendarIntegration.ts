import z from "zod"
import { IntegrationInstance } from "../../core/integration/IntegrationInstance"
import { IntegrationManager } from "../../core/integration/IntegrationManager"
import { IntegrationEntity } from "../../drizzle/schema"
import { TreeBuilder } from "../../core/integration/tree/TreeBuilder"
import ical, { CalendarResponse, VEvent } from "node-ical"
import { IntegrationVariable } from "../../core/integration/variables/IntegrationVariable"
import { OutputTreeEndpoint } from "../../core/integration/tree/OutputTreeEndpoint"


export class CalendarIntegration extends IntegrationInstance<
  z.infer<ReturnType<typeof CalendarIntegration.configSchema>>
> {

  data?: CalendarResponse

  constructor(entity: IntegrationEntity, parent: IntegrationManager) {
    super(entity, parent, CalendarIntegration)
    this.inputs
      .create("event")
      .setLabel("event data")
      .describe("retrieve data from the currently active event")
      .schema({
        output: z.enum(["summary", "description", "start", "end", "url", "event available"]).default("summary"),
        summaries: z.array(z.string()).optional().describe("Summary Titles to match"),
        regex: z.string().optional().describe("Regular Expression to match Event"),
        regexLocation: z.enum(["summary", "description"]).default("summary").describe("location to match regex"),
        timeBeforeEvent: z.number().min(0).default(0).describe("with the modifier this sets how long the event gets sent before it actually starts"),
        timeBeforeEventModifier: z.enum(["minute(s)", "hour(s)", "day(s)"]).default("minute(s)"),
        timeAfterEvent: z.number().min(0).default(0).describe("with the modifier this sets how long the event gets sent after it has started"),
        timeAfterEventModifier: z.enum(["minute(s)", "hour(s)", "day(s)"]).default("minute(s)")
      })
      .currentValue(async ({ config, variable }) => {
        const events = this.getActiveEvents(variable)
        const ignoredEvents = variable.getStoreProperty("ignoreEvents", [] as string[])
        const event = events.find(ev => !ignoredEvents.includes(ev.uid))
        const eventAvailable = !!event
        switch (config.output) {
          case "event available": return eventAvailable
          case "end":
          case "start": return eventAvailable ? event![config.output].toISOString() : ""
          default: return eventAvailable ? String(event![config.output]) : "" 
        }
      })
      .register(async ({ variable, getCurrentValue }) => {
        const interval = setInterval(async () => {
          await variable.updateValue(await getCurrentValue())
        }, 60 * 1000)
        await variable.updateValue(await getCurrentValue())
        return () => clearInterval(interval)
      })
    this.actions
      .create("stop_event")
      .describe("used to confirm an event which wont be displayed anymore")
      .schema({
        variableId: z.number().positive().describe("connected integration variable id")
      })
      .execute(async ({ config, value }) => {
        if (!value.toBoolean()) return
        const variable = this.variables.collection.getBy("id", config.variableId)
        if (!variable) return this.logger.warn(`could not trigger stopEvent for variable id ${config.variableId} because it might have been deleted`)
        const [event] = this.getActiveEvents(variable)
        if (!event) return
        const ignored = variable.getStoreProperty("ignoreEvents", [] as string[])
        await variable.setStoreProperty("ignoreEvents", [...ignored, event.uid])
        await variable.reload()
      })
  }

  private getActiveEvents(variable: IntegrationVariable): VEvent[] {     
    const { config } = variable
    const ignoredEvents = variable.getStoreProperty("ignoreEvents", [] as string[])
    if (variable.config.action !== "event")
      throw new Error(`invalid variable action expected 'event' but got ${variable.config.action}`)   
    return this.events
      .filter(ev => { //filter summaries
        if (!config.summaries || config.summaries.length === 0) return true
        return config.summaries.includes(ev.summary)
      })
      .filter(ev => { //filter regex
        if (!config.regex) return true
        return new RegExp(config.regex).test((ev as any)[config.regexLocation])
      })
      .filter(ev => { //filter if event should have started
        const preStart = this.calculateDuration(config.timeBeforeEvent, config.timeBeforeEventModifier)
        const start = new Date(ev.start)
        return Date.now() > start.getTime() - preStart
      })
      .filter(ev => { //filter if event has ended
        const postStart = this.calculateDuration(config.timeAfterEvent, config.timeAfterEventModifier)
        const start = new Date(ev.start)
        return Date.now() < start.getTime() + postStart
      })
      .filter(ev => !ignoredEvents.includes(ev.uid)) //filter already ignored events
  }

  /**
   * calculates how many ms the time with the modifier should have
   */
  private calculateDuration(time: number, modifier: "minute(s)"|"hour(s)"|"day(s)") {
    switch (modifier) {
      case "minute(s)": return time * 60 * 1000
      case "hour(s)": return time * 60 * 60 * 1000
      case "day(s)": return time * 60 * 60 * 24 * 1000
      default: return 0
    }
  }

  get events(): VEvent[] {
    if (!this.data) return []
    return Object.values(this.data)
      .filter(ev => ev.type === "VEVENT")
      .sort((a, b) => a.start.getTime() - b.start.getTime())
  }

  get calendar() {
    if (!this.data) return null
    return this.data.VCALENDAR
  }

  getConstructor() {
    return CalendarIntegration
  }

  async start() {
    await this.getCalendar()
    await this.variables.reload()
  }

  async stop() {
    
  }

  async getCalendar() {
    const res = await fetch(this.config.url)
    if (res.status !== 200) throw new Error(`received non 200 status code while fetching calendar at ${this.config.url}`)
    const content = await res.text()
    this.data = ical.parseICS(content)
    return this.data
  }

  async getInternalVariables() {
    return null
  }

  specificSerialize() {
    return {
      events: this.events,
      calendar: this.data
    }
  }

  async tree() {
    const tree = new TreeBuilder()
    const quitCategory = tree.addOutputCategory("quit event")
    this.variables.collection
      .filter(v => v.isInput) //only input variables
      .filter(v => v.config.action === "event") //only event actions
      .map(v => {
        const label = `stop '${v.entity.label || v.entity.id}'`
        quitCategory
          .add(OutputTreeEndpoint, label)
          .className("text-amber")
          .setConfig({
            label,
            action: "stop_event",
            variableId: v.entity.id
          })
      })
    return tree.serialize()
  }

  static configSchema() {
    return z.object({
      url: z.url().describe("url of the calendar to fetch"),
      refetch: z.enum(["HOURLY", "DAILY", "WEEKLY", "MONTHLY"]).describe("how often should the calendar be reloaded")
    })
  }
}