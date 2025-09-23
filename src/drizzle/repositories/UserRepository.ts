import { count, eq } from "drizzle-orm"
import { users } from "../schema"
import { DrizzleDatabaseType } from "../database"

export type UpdateUserProps = {
  id: number
} & Partial<CreateUserProps>

export type CreateUserProps = {
  username: string
  password: string
}

export class UserRepository {

  constructor(private readonly db: DrizzleDatabaseType) {}

  export() {    
    return this.db.query.users.findMany()
  }

  findAll() {
    return this.db.query.users
      .findMany()
  }

  findById(id: number) {
    return this.db.query.users
      .findFirst({ where: eq(users.id, id) })
  }

  findByUsername(username: string) {
    return this.db.query.users
      .findFirst({ where: eq(users.username, username) })
  }
  
  create(props: CreateUserProps) {
    return this.db
      .insert(users)
      .values(props)
      .returning()
      .then(([r]) => r)
  }
  
  remove(id: number) {
    return this.db
      .delete(users)
      .where(eq(users.id, id))
  }
  
  update({ id, ...props }: UpdateUserProps) {
    return this.db
      .update(users)
      .set(props)
      .where(eq(users.id, id))
      .then(() => this.findById(id))
  }

  count() {
    return this.db
      .select({ count: count() })
      .from(users)
      .then(([r]) => r)
  }

}

export type UserConfig = {
  username: string
  password: string
}