import jwt from "jsonwebtoken"
import { RepositoryContainer, ServiceContainer } from "../container"
import { IAppService } from "../types/appService"
import { UserEntity } from "../drizzle/schema"

export class AuthService implements IAppService {

  constructor(
    private readonly repositories: RepositoryContainer
  ) {}

  get secret() {
    const secret = process.env.SECRET
    if (!secret) throw new Error("SECRET environment variable is not set. Please set it to a secure value.")
    return secret
  }

  async init(services: ServiceContainer) {}
  async stop() {}

  private extractUserData({ id, username }: UserEntity): TokenData {
    return { id, username }
  }

  /**
   * creates a new JWT token with the provided data
   * @param data
   * @returns 
   */
  sign(user: UserEntity) {
    const payload = this.extractUserData(user)
    return {
      user: payload,
      token: jwt.sign(payload, this.secret, { expiresIn: '5d' })
    }
  }

  /**
   * validates the jwt token
   * @param token 
   * @returns 
   */
  async verify(token: string): Promise<any> {
    try {
      return jwt.verify(token, this.secret)
    } catch (error) {
      return undefined
    }
  }

}

export type TokenData = {
  id: number
  username: string
}