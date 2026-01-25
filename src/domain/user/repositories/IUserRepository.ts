import { User } from "../entities/User"
import { UserId, Email } from "../value-objects"

export interface IUserRepository {
  findById(id: UserId): Promise<User | null>
  findByEmail(email: Email): Promise<User | null>
  findByEmailString(email: string): Promise<User | null>
  save(user: User): Promise<void>
  findPending(): Promise<User[]>
  findAll(): Promise<User[]>
}
