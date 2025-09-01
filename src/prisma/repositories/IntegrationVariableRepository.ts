import { IntegrationVariable, Link, PrismaClient, VariableDirection } from "@prisma/client"

export type IntegrationVariableData = IntegrationVariable & {
  links?: Link[]
}

export class IntegrationVariableRepository {

  constructor(private readonly prisma: PrismaClient) {}

  findAll() {
    return this.prisma.integrationVariable.findMany({
      include: { links: true  }
    })
  }

  findById(id: string) {
    return this.prisma.integrationVariable.findUnique({
      where: { id },
      include: { links: true  }
    })
  }
  
  findLinkableById(id: string) {
    return this.prisma.integrationVariable.findFirst({
      where: {
        id,
        OR: [{
          direction: VariableDirection.INPUT
        }, {
          direction: VariableDirection.OUTPUT,
          links: { none: {} },
        }]
      },
      include: { links: true  }
    })
  }

  findByIntegrationId(integrationId: string) {
    return this.prisma.integrationVariable.findMany({
      where: { integrationId },
      include: { links: true  }
    })
  }

  create(data: Omit<IntegrationVariable, "id">) {
    return this.prisma.integrationVariable.create({
      //@ts-ignore
      data,
      include: { links: true  }
    })
  }

  remove(id: string) {
    return this.prisma.integrationVariable.delete({
      where: { id },
    })
  }

  update(id: string, { links, ...data }: Partial<IntegrationVariableData>) {
    return this.prisma.integrationVariable.update({
      where: { id },
      //@ts-ignore
      data
    })
  }

}