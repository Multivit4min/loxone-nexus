import { Request, Response } from "express"
import { UnauthorizedError } from "./UnauthorizedError"
import { User } from "@prisma/client"
import { services } from "../../container"

export class ExpressStore {

  private _authenticated?: User
  private _token?: string

  constructor(
    private readonly req: Request,
    private readonly res: Response
  ) {}

  get access_token() {    
    if (this._token) return this._token
    const auth = this.req.headers.authorization
    if (!auth || !auth.startsWith("Bearer ")) throw new UnauthorizedError("Invalid authorization header format")
    this._token = auth.split(" ")[1]
    return this._token
  }

  async getAuthentication(): Promise<User> {
    if (this._authenticated) return this._authenticated
    if (!this.access_token) throw new UnauthorizedError("Unauthorized")
    const user = await services.userService.getByToken(this.access_token)
    if (!user) throw new UnauthorizedError("Invalid Token or User not found")
    this._authenticated = user
    return user
  }



}