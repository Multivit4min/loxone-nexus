import { IntegrationVariable } from "./integration"
import { LoxoneVariable } from "./loxone"

export type LinkCreateProps = {
  //integration variable id
  integrationVariable: number
  //loxone variable id
  loxoneVariable: number
} 

export type CreateLinkResponse = {
  id: number
  loxoneVariableId: number
  integrationVariableId: number
  loxoneVariable: LoxoneVariable
  integrationVariable: IntegrationVariable
}