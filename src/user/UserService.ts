import { RepositoryContainer, ServiceContainer } from "../container"
import argon from "argon2"
import { IAppService } from "../types/appService"

export class UserService implements IAppService {

  private services!: ServiceContainer

  constructor(
    private readonly repositories: RepositoryContainer
  ) {}

  async init(services: ServiceContainer) {
    this.services = services
  }
  async stop() {}


  all() {
    return this.repositories.user.findAll()
  }


  /**
   * retrieves a single user by its id
   */
  getById(id: string) {
    return this.repositories.user.findById(id)
  }

  /**
   * creates a new user
   * @param username
   * @param password
   */
  async create(username: string, password: string) {
    return this.repositories.user.create({
      username,
      password: await argon.hash(password)
    })
  }

  /**
   * removes a user by its id
   * note: admin can not be removed
   * @param id 
   * @returns 
   */
  async remove(id: string) {
    const user = await this.repositories.user.findById(id)
    if (!user) return
    return this.repositories.user.remove(id)
  }

  /**
   * tries to retrieve a user by username + password
   * @param username 
   * @param password 
   * @returns 
   */
  async login(username: string, password: string) {
    const user = await this.repositories.user.findByUsername(username)
    if (!user) return false
    if (await argon.verify(user.password, password)) {
      return this.services.authService.sign(user)
    }
    return false
  }

  /**
   * retrieve a user by its access token
   */
  async getByToken(token: string) {
    const data = await this.services.authService.verify(token)
    if (!data) return null
    const user = await this.getById(data.id)
    if (!user) return null
    return user
  }

  /**
   * changes the password of the user
   * @param id 
   * @param newPassword 
   * @returns 
   */
  async updatePassword(id: string, newPassword: string) {
    return this.repositories.user.update(id, { password: await argon.hash(newPassword) })
  }

  async updateUser(id: string, props: { username?: string, password?: string }) {
    const user = await this.repositories.user.findById(id)
    if (!user) throw new Error("user not found")
    if (props.password) props.password = await argon.hash(props.password)
    return this.repositories.user.update(user.id, props)
  }

}