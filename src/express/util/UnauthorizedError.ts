export class UnauthorizedError extends Error {

  readonly name = "UnauthorizedError"
  readonly statusCode = 401

  constructor(message: string = "Unauthorized") {
    super(message)
    Object.setPrototypeOf(this, UnauthorizedError.prototype)
  }
}