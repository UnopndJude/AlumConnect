import { User } from "@/domain/user/entities/User"
import { UserStatusType } from "@/domain/user/value-objects"

export interface RegisterUserDto {
  email: string
  password: string
  name: string
  graduationClass: number
}

export interface LoginUserDto {
  email: string
  password: string
}

export interface UserResponseDto {
  id: string
  email: string
  name: string
  graduationClass: number
  status: UserStatusType
  isAdmin: boolean
  createdAt: Date
  approvedAt?: Date
  rejectedAt?: Date
}

export function toUserResponseDto(user: User): UserResponseDto {
  const primitives = user.toPrimitives()
  return {
    id: primitives.id,
    email: primitives.email,
    name: primitives.name,
    graduationClass: primitives.graduationClass,
    status: primitives.status,
    isAdmin: primitives.isAdmin,
    createdAt: primitives.createdAt,
    approvedAt: primitives.approvedAt,
    rejectedAt: primitives.rejectedAt,
  }
}
