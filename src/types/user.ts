// Re-export from domain for backward compatibility
export type { UserStatusType as UserStatus } from "@/domain/user/value-objects/UserStatus"

export interface User {
  id: string
  email: string
  password: string
  name: string
  graduationClass: number
  status: "pending" | "approved" | "rejected"
  createdAt: Date
  approvedAt?: Date
  rejectedAt?: Date
  isAdmin: boolean
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  password: string
  name: string
  graduationClass: number
}
