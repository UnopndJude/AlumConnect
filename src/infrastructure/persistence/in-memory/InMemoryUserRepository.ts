import { User } from "@/domain/user/entities/User"
import { IUserRepository } from "@/domain/user/repositories/IUserRepository"
import {
  UserId,
  Email,
  Password,
  GraduationClass,
  UserStatus,
} from "@/domain/user/value-objects"

const users: Map<string, User> = new Map()

// Initialize admin user
const emailResult = Email.create("admin@incheon-sci.hs.kr")
const gradClassResult = GraduationClass.create(1)

if (emailResult.success && gradClassResult.success) {
  const adminUser = User.reconstitute({
    id: UserId.create("admin-1"),
    email: emailResult.value,
    password: Password.createFromHashed("admin123"),
    name: "관리자",
    graduationClass: gradClassResult.value,
    status: UserStatus.approved(),
    isAdmin: true,
    createdAt: new Date(),
    approvedAt: new Date(),
  })
  users.set(adminUser.id.getValue(), adminUser)
}

export class InMemoryUserRepository implements IUserRepository {
  async findById(id: UserId): Promise<User | null> {
    return users.get(id.getValue()) || null
  }

  async findByEmail(email: Email): Promise<User | null> {
    for (const user of users.values()) {
      if (user.email.equals(email)) {
        return user
      }
    }
    return null
  }

  async findByEmailString(email: string): Promise<User | null> {
    for (const user of users.values()) {
      if (user.email.getValue() === email.toLowerCase()) {
        return user
      }
    }
    return null
  }

  async save(user: User): Promise<void> {
    users.set(user.id.getValue(), user)
  }

  async findPending(): Promise<User[]> {
    return Array.from(users.values()).filter((u) => u.status.isPending())
  }

  async findAll(): Promise<User[]> {
    return Array.from(users.values())
  }
}
