export class ApiError extends Error {
  constructor(
    readonly response: Response,
    readonly body: any
  ) {
    super(`received status ${response.status}`)
  }
}