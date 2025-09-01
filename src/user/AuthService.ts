import { User } from "@prisma/client"
import jwt from "jsonwebtoken"
import { RepositoryContainer, ServiceContainer } from "../container"

export class AuthService {

  constructor(
    private readonly repositories: RepositoryContainer,
    private readonly secret: string
  ) {}

  async init(services: ServiceContainer) {}

  private extractUserData({ id, username }: User): TokenData {
    return { id, username }
  }

  /**
   * creates a new JWT token with the provided data
   * @param data
   * @returns 
   */
  sign(user: User) {
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
  id: string
  username: string
}