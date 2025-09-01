import { Link, PrismaClient } from "@prisma/client"

export class LinkRepository {

  constructor(private readonly prisma: PrismaClient) {}

  findAll() {
    return this.prisma.link.findMany()
  }

  create(data: Omit<Link, "id">) {
    return this.prisma.link.create({
      data,
    })
  }

  remove(integrationVariableId: string, loxoneVariableId: string) {
    return this.prisma.link.delete({
      where: { 
        variableCompound: {
          integrationVariableId,
          loxoneVariableId
        }
      },
    })
  }

}

export type UserConfig = {
  username: string
  password: string
}