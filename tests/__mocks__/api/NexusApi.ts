import { ApiError } from "./ApiError"
import { ApiResponse } from "./types/api"
import { LoginResponse, WhoAmIResponse } from "./types/auth"
import { Integration, IntegrationConfig, IntegrationCreateProps, IntegrationUpdateProps, IntegrationVariable, IntegrationVariableConfig, IntegrationVariableCreateProps } from "./types/integration"
import { LoxoneInstanceCreateProps, LoxoneInstanceVariableUpdateProps, LoxoneInstanceUpdateProps, LoxoneInstance, LoxoneInstancesResponse, LoxoneInstanceVariableCreateProps, LoxoneVariable } from "./types/loxone"
import { UpdateUserProps, User, Users } from "./types/users"

export class NexusApi {

  private token?: string

  /**
   * @param address address on where the server is reachable
   */
  constructor(readonly address: string) {

  }

  /**
   * Makes a request to the API with the specified method and URL.
   * @param method The HTTP method to use (GET, POST, PATCH, DELETE).
   * @param url The URL to request.
   */
  private async request<T>(method: "GET"|"POST"|"PATCH"|"DELETE", path: string, payload?: object): Promise<T> {
    let body: string | undefined
    const headers: Record<string, string> = {}
    if (payload) {
      headers["Content-Type"] = "application/json"
      body = JSON.stringify(payload)
    }
    if (this.token) headers.Authorization = `Bearer ${this.token}`
    const res = await fetch(`${this.address}${path}`, { method, headers, body })
    let data: T|undefined
    if (res.headers.get("Content-Type")?.includes("application/json")) {
      data = await res.json()
    }
    if (!res.ok) throw new ApiError(res, data)
    return data as T
  }

  private get<T = any>(url: string) {
    return this.request<T>("GET", url)
  }

  private post<T = any>(url: string, data: object) {
    return this.request<T>("POST", url, data)
  }

  private patch<T = any>(url: string, data?: object) {
    return this.request<T>("PATCH", url, data)
  }

  private delete<T = any>(url: string) {
    return this.request<T>("DELETE", url)
  }

  /**
   * retrieve current user data
   * @returns 
   */
  whoami() {
    return this.get<WhoAmIResponse>("/api/whoami")
  }

  /**
   * login with the selected username
   * @param username username to login
   * @param password password for the user
   */
  async login(username: string, password: string) {
    const response = await this.post<LoginResponse>("/api/auth/login", { username, password })
    if (response.token) this.token = response.token
    return response
  }

  /**
   * retrieve public api information
   * @returns 
   */
  apiConfig() {
    return this.get<ApiResponse>("/api/")
  }

  /**
   * runs the setup process for the application
   * this can only be run if no user exists
   * @param username username of the new user
   * @param password password of the new user
   * @returns 
   */
  async setup(username: string, password: string) {
    const response = await this.post<LoginResponse>("/api/setup", { username, password })
    if (response.token) this.token = response.token
    return response
  }

  /**
   * retrieves the userlist
   * @returns 
   */
  getUsers() {
    return this.get<Users>("/api/users")
  }

  /**
   * creates a new user
   * @param username username of the new user
   * @param password password of the new user
   */
  createUser(username: string, password: string) {
    return this.post<User>("/api/users", { username, password })
  }

  /**
   * deletes the user with the selected userid
   * @param id user id to delete
   * @returns 
   */
  deleteUser(id: number) {
    return this.delete<{}>(`/api/users/${id}`)
  }

  /**
   * deletes the user with the selected userid
   * @param id user id to delete
   * @returns 
   */
  updateUser(id: number, props: UpdateUserProps) {
    return this.patch<User>(`/api/users/${id}`, props)
  }

  /**
   * creates a new loxone instance
   * @param props 
   */
  createLoxoneInstance(props: LoxoneInstanceCreateProps) {
    return this.post<LoxoneInstance>(`/api/loxone`, props)
  }

  /**
   * updates the loxone instance
   * @param id 
   * @param props 
   * @returns 
   */
  updateLoxoneInstance(id: number, props: LoxoneInstanceUpdateProps) {
    return this.patch<LoxoneInstance>(`/api/loxone/${id}`, props)
  }

  /**
   * deletes a loxone instance
   * @param id 
   * @returns 
   */
  deleteLoxoneInstance(id: number) {
    return this.delete(`/api/loxone/${id}`)
  }

  /**
   * starts the loxone instance
   * @param id id of the instance
   * @returns 
   */
  startLoxoneInstance(id: number) {
    return this.patch(`/api/loxone/${id}/start`)
  }

  /**
   * stops the loxone instance
   * @param id id of the instance
   * @returns 
   */
  stopLoxoneInstance(id: number) {
    return this.patch(`/api/loxone/${id}/stop`)
  }

  /**
   * retrieve a single loxone instance by its id
   * @param id id of the instance
   * @returns 
   */
  getLoxoneInstance(id: number) {
    return this.get<LoxoneInstance>(`/api/loxone/${id}`)
  }

  /**
   * retrieves all loxone instances
   * @param id id of the instance
   * @returns 
   */
  getLoxoneInstances() {
    return this.get<LoxoneInstancesResponse>(`/api/loxone`)
  }

  /**
   * creates a new loxone variable on an instance
   * @param loxoneId the instance to create the variable on
   * @param props variable properties
   * @returns 
   */
  createLoxoneVariable(loxoneId: number, props: LoxoneInstanceVariableCreateProps) {
    return this.post<LoxoneVariable>(`/api/loxone/${loxoneId}/variables`, props)
  }

  /**
   * updates the specified loxone variable with new data
   * @param loxoneId loxone instance the variable belongs to
   * @param variableId loxone variable to update
   * @param props data
   * @returns 
   */
  updateLoxoneVariable(loxoneId: number, variableId: number, props: LoxoneInstanceVariableUpdateProps) {
    return this.patch<LoxoneVariable>(`/api/loxone/${loxoneId}/variables/${variableId}`, props)
  }

  /**
   * deletes the specified loxone variable
   * @param loxoneId loxone instance the variable belongs to
   * @param variableId loxone variable to delete
   * @returns 
   */
  deleteLoxoneVariable(loxoneId: number, variableId: number) {
    return this.delete<LoxoneInstance>(`/api/loxone/${loxoneId}/variables/${variableId}`)
  }
  
  /**
   * retrieves a list of integrations
   * @param props 
   * @returns 
   */
  async getIntegrations() {
    const { entries } = await this.get<Integration[]>(`/api/integration`)
    return entries
  }
  
  /**
   * creates a new integration
   * @param props 
   * @returns 
   */
  createIntegration<T extends IntegrationConfig>(props: IntegrationCreateProps<T>) {
    return this.post<Integration<T>>(`/api/integration`, props)
  }


  /**
   * updates an integration
   * @param id instance id of the integration 
   * @param props 
   * @returns 
   */
  updateIntegration<T extends IntegrationConfig>(id: number, props: IntegrationUpdateProps<T>) {
    return this.patch<Integration<T>>(`/api/integration/${id}`, props)
  }


  /**
   * deletes an integration
   * @param id instance id of the integration 
   * @returns 
   */
  deleteIntegration(id: number) {
    return this.delete(`/api/integration/${id}`)
  }

  /**
   * creates a new integration variable on the chosen integration
   * @param integrationId the instance to create the variable on
   * @param props variable properties
   * @returns 
   */
  createIntegrationVariable<T extends IntegrationVariableConfig>(integrationId: number, props: IntegrationVariableCreateProps<T>) {
    return this.post<IntegrationVariable<T>>(`/api/integration/${integrationId}/variable`, props)
  }

  /**
   * creates a new integration variable on the chosen integration
   * @param integrationId the instance to create the variable on
   * @param props variable properties
   * @returns 
   */
  deleteIntegrationVariable(integrationId: number, variableId: number) {
    return this.delete<Integration>(`/api/integration/${integrationId}/variable/${variableId}`)
  }

}