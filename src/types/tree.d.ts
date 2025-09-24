export type TreeProps = {
  inputs?: InputTreeEntry[]
  outputs?: OutputTreeEntry[]
}

export type InputTreeEntry = TreeCategory<InputTreeEndpoint>
export type OutputTreeEntry = TreeCategory<OutputTreeEndpoint>

export type TreeBase = {
  label: string
  comment?: string
  class?: string
  icon?: string
  bold?: boolean
  disabled?: boolean
}

export type TreeCategory<T extends TreeBase = any> = {
  children: (TreeCategory<T>|T)[]
} & TreeBase

export type OutputTreeEndpoint = {
  config: Record<string, any>
} & TreeBase

export type InputTreeEndpoint = {
  value: string|number|boolean
  config: Record<string, any>
} & TreeBase