import { HaosCommand } from "./HaosCommand"

export class GetServicesCommand extends HaosCommand<GetServicesCommand.Payload, GetServicesCommand.Response> {

  readonly type = "get_services"

  async handleResponse(
    res: Record<string, any>,
    resolve: (data?: any) => void,
    reject: (err: Error) => void
  ) {
    if (res.success) {
      resolve(res.result)
    } else {
      reject(new Error(res.error.message))
    }
  }

}

export namespace GetServicesCommand {

  export type Payload = {
    type: "get_services"
  }

  export type Response = Record<string, Record<string, ServiceData>>

  export type ServiceData = {
    name: string
    description: string
    fields: Record<string, any>
    target?: { entity?: any[], device?: any[] }
  }

}