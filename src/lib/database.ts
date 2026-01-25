// Compatibility layer - delegates to new architecture
import { container } from "@/infrastructure/di/container"
import { User } from "@/types/user"
import { UserId } from "@/domain/user/value-objects"

export const getUserByEmail = async (
  email: string
): Promise<User | undefined> => {
  const user = await container.getUserRepository().findByEmailString(email)
  return user ? (user.toPrimitives() as User) : undefined
}

export const getUserById = async (id: string): Promise<User | undefined> => {
  const user = await container.getUserRepository().findById(UserId.create(id))
  return user ? (user.toPrimitives() as User) : undefined
}

export const getPendingUsers = async (): Promise<User[]> => {
  const users = await container.getUserRepository().findPending()
  return users.map((u) => u.toPrimitives() as User)
}

export const getAllUsers = async (): Promise<User[]> => {
  const users = await container.getUserRepository().findAll()
  return users.map((u) => u.toPrimitives() as User)
}
