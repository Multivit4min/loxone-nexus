import { PrismaClient } from "@prisma/client"

export class LoxoneRepository {

  constructor(private readonly prisma: PrismaClient) {}

  findAll() {
    return this.prisma.loxone.findMany()
  }

  findById(id: string) {
    return this.prisma.loxone.findUnique({
      where: { id },
    })
  }

  create(data: LoxoneConfig) {
    return this.prisma.loxone.create({
      data,
    })
  }

  remove(id: string) {
    return this.prisma.loxone.delete({
      where: { id },
    })
  }

  update(id: string, data: Partial<LoxoneConfig>) {
    return this.prisma.loxone.update({
      where: { id },
      data,
    })
  }
}

export type LoxoneConfig = {
  active: boolean
  label: string
  host: string
  port: number
  listenPort: number
  remoteId: string
  ownId: string
}