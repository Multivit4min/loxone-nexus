import { Integration, PrismaClient } from "@prisma/client"

export class IntegrationRepository {

  constructor(private readonly prisma: PrismaClient) {}

  findAll() {
    return this.prisma.integration.findMany()
  }

  findById(id: string) {
    return this.prisma.integration.findUnique({
      where: { id }
    })
  }

  create(data: Omit<Integration, "id">) {
    return this.prisma.integration.create({
      //@ts-ignore
      data,
    })
  }

  remove(id: string) {
    return this.prisma.integration.delete({
      where: { id },
    })
  }

  update(id: string, data: Partial<Integration>) {
    return this.prisma.integration.update({
      where: { id },
      //@ts-ignore
      data,
    })
  }

}