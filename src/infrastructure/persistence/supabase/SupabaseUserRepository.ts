import { User } from "@/domain/user/entities/User"
import { IUserRepository } from "@/domain/user/repositories/IUserRepository"
import {
  UserId,
  Email,
  Password,
  GraduationClass,
  UserStatus,
  UserStatusType,
} from "@/domain/user/value-objects"
import { createServerSupabaseClient } from "@/infrastructure/supabase"

export class SupabaseUserRepository implements IUserRepository {
  private get supabase() {
    return createServerSupabaseClient()
  }

  async findById(id: UserId): Promise<User | null> {
    const { data, error } = await this.supabase
      .from("users")
      .select("*")
      .eq("id", id.getValue())
      .single()

    if (error || !data) return null
    return this.toDomain(data)
  }

  async findByEmail(email: Email): Promise<User | null> {
    return this.findByEmailString(email.getValue())
  }

  async findByEmailString(email: string): Promise<User | null> {
    const { data, error } = await this.supabase
      .from("users")
      .select("*")
      .eq("email", email.toLowerCase())
      .single()

    if (error || !data) return null
    return this.toDomain(data)
  }

  async save(user: User): Promise<void> {
    const primitives = user.toPrimitives()

    const { error } = await this.supabase.from("users").upsert({
      id: primitives.id,
      email: primitives.email,
      password: primitives.password,
      name: primitives.name,
      graduation_class: primitives.graduationClass,
      status: primitives.status,
      is_admin: primitives.isAdmin,
      created_at: primitives.createdAt.toISOString(),
      approved_at: primitives.approvedAt?.toISOString() || null,
      rejected_at: primitives.rejectedAt?.toISOString() || null,
    })

    if (error) {
      throw new Error(`Failed to save user: ${error.message}`)
    }
  }

  async findPending(): Promise<User[]> {
    const { data, error } = await this.supabase
      .from("users")
      .select("*")
      .eq("status", "pending")

    if (error || !data) return []
    return data.map((row) => this.toDomain(row)).filter(Boolean) as User[]
  }

  async findAll(): Promise<User[]> {
    const { data, error } = await this.supabase.from("users").select("*")

    if (error || !data) return []
    return data.map((row) => this.toDomain(row)).filter(Boolean) as User[]
  }

  private toDomain(row: {
    id: string
    email: string
    password: string
    name: string
    graduation_class: number
    status: string
    is_admin: boolean
    created_at: string
    approved_at: string | null
    rejected_at: string | null
  }): User | null {
    const emailResult = Email.create(row.email)
    const gradClassResult = GraduationClass.create(row.graduation_class)

    if (!emailResult.success || !gradClassResult.success) return null

    return User.reconstitute({
      id: UserId.create(row.id),
      email: emailResult.value,
      password: Password.createFromHashed(row.password),
      name: row.name,
      graduationClass: gradClassResult.value,
      status: UserStatus.fromString(row.status as UserStatusType),
      isAdmin: row.is_admin,
      createdAt: new Date(row.created_at),
      approvedAt: row.approved_at ? new Date(row.approved_at) : undefined,
      rejectedAt: row.rejected_at ? new Date(row.rejected_at) : undefined,
    })
  }
}
