import { Link, PrismaClient } from "@prisma/client"

export class LinkRepository {

  constructor(private readonly prisma: PrismaClient) {}

  findAll() {
    return this.prisma.link.findMany()
  }

  findById(id: string) {
    return this.prisma.link.findUnique({
      where: { id }
    })
  }

  create(data: Omit<Link, "id">) {
    return this.prisma.link.create({
      data,
    })
  }

  remove(id: string) {
    return this.prisma.link.delete({
      where: { id },
    })
  }

}

export type UserConfig = {
  username: string
  password: string
}