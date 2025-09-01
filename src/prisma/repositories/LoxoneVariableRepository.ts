import { Link, LoxoneVariable, PrismaClient, VariableDirection } from "@prisma/client"

export type LoxoneVariableData = LoxoneVariable & {
  links?: Link[]
}

export class LoxoneVariableRepository {

  constructor(private readonly prisma: PrismaClient) {}

  findAll() {
    return this.prisma.loxoneVariable.findMany({ 
      include: { links: true }
    })
  }

  findById(id: string) {
    return this.prisma.loxoneVariable.findUnique({
      where: { id },
      include: { links: true  }
    })
  }

  findByInstance(loxoneId: string) {
    return this.prisma.loxoneVariable.findMany({
      where: { loxoneId },
      include: { links: true }
    })
  }

  findLinkableById(id: string) {
    return this.prisma.loxoneVariable.findFirst({
      where: {
        id,
        OR: [{
          direction: VariableDirection.INPUT
        }, {
          direction: VariableDirection.OUTPUT,
          links: { none: {} },
        }]
      },
      include: { links: true }
    })
  }

  create(data: Omit<LoxoneVariable, "id">) {
    return this.prisma.loxoneVariable.create({
      data,
      include: { links: true }
    })
  }

  getInputs() {
    return this.prisma.loxoneVariable.findMany({
      where: {
        direction: VariableDirection.INPUT
      },
      select: {
        loxoneId: true,
        id: true
      }
    })
  }

  getUnusedOutputs() {
    return this.prisma.loxoneVariable.findMany({
      where: {
        links: { none: {} },
        direction: VariableDirection.OUTPUT
      },
      select: {
        loxoneId: true,
        id: true
      }
    })
  }

  remove(id: string) {
    return this.prisma.loxoneVariable.delete({
      where: { id },
    })
  }

  update(id: string, { links, ...data }: Partial<LoxoneVariableData>) {
    return this.prisma.loxoneVariable.update({
      where: { id },
      data
    })
  }

}