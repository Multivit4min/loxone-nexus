import { Prisma, PrismaClient } from "@prisma/client"
import { DefaultArgs } from "@prisma/client/runtime/library"

export class UserRepository {

  constructor(private readonly prisma: PrismaClient) {}

  findAll() {
    return this.prisma.user.findMany()
  }

  findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
    })
  }

  findByUsername(username: string) {
    return this.prisma.user.findUnique({
      where: { username },
    })
  }

  create(data: UserConfig) {
    return this.prisma.user.create({
      data,
    })
  }

  remove(id: string) {
    return this.prisma.user.delete({
      where: { id },
    })
  }

  update(id: string, data: Partial<UserConfig>) {
    return this.prisma.user.update({
      where: { id },
      data,
    })
  }

  count(args?: Prisma.Subset<Prisma.UserCountArgs<DefaultArgs>, Prisma.UserCountArgs<DefaultArgs>>) {
    return this.prisma.user.count(args)
  }

}

export type UserConfig = {
  username: string
  password: string
}