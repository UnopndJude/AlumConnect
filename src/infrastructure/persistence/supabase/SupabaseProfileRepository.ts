import { Profile } from "@/domain/profile/entities/Profile"
import {
  IProfileRepository,
  ProfileFilters,
  Pagination,
  PaginatedResult,
} from "@/domain/profile/repositories/IProfileRepository"
import { ProfileId } from "@/domain/profile/value-objects"
import { Email, GraduationClass } from "@/domain/user/value-objects"
import { createServerSupabaseClient } from "@/infrastructure/supabase"

export class SupabaseProfileRepository implements IProfileRepository {
  private get supabase() {
    return createServerSupabaseClient()
  }

  async findById(id: ProfileId): Promise<Profile | null> {
    const { data, error } = await this.supabase
      .from("profiles")
      .select("*")
      .eq("id", id.getValue())
      .single()

    if (error || !data) return null
    return this.toDomain(data)
  }

  async findByEmail(email: Email): Promise<Profile | null> {
    const { data, error } = await this.supabase
      .from("profiles")
      .select("*")
      .eq("email", email.getValue().toLowerCase())
      .single()

    if (error || !data) return null
    return this.toDomain(data)
  }

  async findByAlumniId(alumniId: string): Promise<Profile | null> {
    const { data, error } = await this.supabase
      .from("profiles")
      .select("*")
      .eq("alumni_id", alumniId)
      .single()

    if (error || !data) return null
    return this.toDomain(data)
  }

  async findAll(
    filters?: ProfileFilters,
    pagination?: Pagination
  ): Promise<PaginatedResult<Profile>> {
    let query = this.supabase.from("profiles").select("*", { count: "exact" })

    // Apply filters
    if (filters?.name) {
      query = query.ilike("name", `%${filters.name}%`)
    }

    if (filters?.graduationClass) {
      query = query.eq("graduation_class", filters.graduationClass)
    }

    if (filters?.excludeProfileId) {
      query = query.neq("id", filters.excludeProfileId)
    }

    // Apply pagination
    const page = pagination?.page || 1
    const limit = pagination?.limit || 20
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit - 1

    query = query.range(startIndex, endIndex).order("created_at", { ascending: false })

    const { data, error, count } = await query

    if (error) {
      throw new Error(`Failed to fetch profiles: ${error.message}`)
    }

    const profiles = (data || [])
      .map((row) => this.toDomain(row))
      .filter((p): p is Profile => p !== null)

    const total = count || 0

    return {
      items: profiles,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    }
  }

  async save(profile: Profile): Promise<void> {
    const primitives = profile.toPrimitives()

    const { error } = await this.supabase.from("profiles").upsert({
      id: primitives.id,
      email: primitives.email,
      name: primitives.name,
      graduation_class: primitives.graduationClass,
      is_verified: primitives.isVerified,
      is_admin: primitives.isAdmin,
      alumni_id: primitives.alumniId,
      created_at: primitives.createdAt.toISOString(),
    })

    if (error) {
      throw new Error(`Failed to save profile: ${error.message}`)
    }
  }

  private toDomain(row: {
    id: string
    email: string
    name: string
    graduation_class: number
    is_verified: boolean
    is_admin: boolean
    alumni_id: string | null
    created_at: string
  }): Profile | null {
    const emailResult = Email.create(row.email)
    const gradClassResult = GraduationClass.create(row.graduation_class)

    if (!emailResult.success || !gradClassResult.success) return null

    return Profile.reconstitute({
      id: ProfileId.create(row.id),
      email: emailResult.value,
      name: row.name,
      graduationClass: gradClassResult.value,
      isVerified: row.is_verified,
      isAdmin: row.is_admin,
      alumniId: row.alumni_id,
      createdAt: new Date(row.created_at),
    })
  }
}
