import { IntegrationVariable, Link, LoxoneVariable, PrismaClient } from "@prisma/client"

export type LinkEntity = Link  & {
    loxoneVariable: LoxoneVariable,
    integrationVariable: IntegrationVariable
  }

export class LinkRepository {

  constructor(private readonly prisma: PrismaClient) {}

  findAll(): Promise<LinkEntity[]> {
    return this.prisma.link.findMany({
      include: {
        loxoneVariable: true,
        integrationVariable: true
      }
    })  
  }

  findById(id: string): Promise<LinkEntity|null> {
    return this.prisma.link.findUnique({
      where: { id },
      include: {
        loxoneVariable: true,
        integrationVariable: true
      }
    })
  }

  create(data: Omit<Link, "id">): Promise<LinkEntity> {
    return this.prisma.link.create({
      data,
      include: {
        loxoneVariable: true,
        integrationVariable: true
      }
    })
  }

  remove(id: string) {
    return this.prisma.link.delete({
      where: { id }
    })
  }

}

export type UserConfig = {
  username: string
  password: string
}