import {
  Introduction,
  IntroductionStatus,
  ContactPreference,
  LookingFor,
} from "@/domain/introduction/entities/Introduction"
import { IIntroductionRepository } from "@/domain/introduction/repositories/IIntroductionRepository"
import { UserId } from "@/domain/user/value-objects"
import { createServerSupabaseClient } from "@/infrastructure/supabase"

export class SupabaseIntroductionRepository implements IIntroductionRepository {
  private get supabase() {
    return createServerSupabaseClient()
  }

  async findById(id: string): Promise<Introduction | null> {
    const { data, error } = await this.supabase
      .from("introductions")
      .select("*")
      .eq("id", id)
      .single()

    if (error || !data) return null
    return this.toDomain(data)
  }

  async findByUserId(userId: UserId): Promise<Introduction | null> {
    const { data, error } = await this.supabase
      .from("introductions")
      .select("*")
      .eq("user_id", userId.getValue())
      .single()

    if (error || !data) return null
    return this.toDomain(data)
  }

  async findAll(): Promise<Introduction[]> {
    const { data, error } = await this.supabase
      .from("introductions")
      .select("*")
      .order("created_at", { ascending: false })

    if (error || !data) return []
    return data.map((row) => this.toDomain(row))
  }

  async findByGraduationClass(
    graduationClass: number
  ): Promise<Introduction[]> {
    const { data, error } = await this.supabase
      .from("introductions")
      .select("*")
      .eq("graduation_class", graduationClass)
      .order("created_at", { ascending: false })

    if (error || !data) return []
    return data.map((row) => this.toDomain(row))
  }

  async search(query: string): Promise<Introduction[]> {
    const { data, error } = await this.supabase
      .from("introductions")
      .select("*")
      .or(
        `name.ilike.%${query}%,field.ilike.%${query}%,organization.ilike.%${query}%,self_introduction.ilike.%${query}%`
      )
      .order("created_at", { ascending: false })

    if (error || !data) return []
    return data.map((row) => this.toDomain(row))
  }

  async save(introduction: Introduction): Promise<void> {
    const primitives = introduction.toPrimitives()

    const { error } = await this.supabase.from("introductions").upsert({
      id: primitives.id,
      user_id: primitives.userId,
      name: primitives.name,
      graduation_class: primitives.graduationClass,
      status: primitives.status,
      field: primitives.field || null,
      organization: primitives.organization || null,
      location: primitives.location || null,
      self_introduction: primitives.selfIntroduction,
      looking_for: primitives.lookingFor || null,
      interests: primitives.interests || null,
      expertise: primitives.expertise || null,
      projects: primitives.projects || null,
      contact_preference: primitives.contactPreference || null,
      contact_info: primitives.contactInfo || null,
      created_at: primitives.createdAt.toISOString(),
      updated_at: primitives.updatedAt.toISOString(),
    })

    if (error) {
      throw new Error(`Failed to save introduction: ${error.message}`)
    }
  }

  async delete(id: string): Promise<boolean> {
    const { error } = await this.supabase
      .from("introductions")
      .delete()
      .eq("id", id)

    return !error
  }

  private toDomain(row: {
    id: string
    user_id: string
    name: string
    graduation_class: number
    status: string
    field: string | null
    organization: string | null
    location: string | null
    self_introduction: string
    looking_for: string | null
    interests: string | null
    expertise: string | null
    projects: string | null
    contact_preference: string | null
    contact_info: string | null
    created_at: string
    updated_at: string
  }): Introduction {
    return Introduction.reconstitute({
      id: row.id,
      userId: UserId.create(row.user_id),
      name: row.name,
      graduationClass: row.graduation_class,
      status: row.status as IntroductionStatus,
      field: row.field || undefined,
      organization: row.organization || undefined,
      location: row.location || undefined,
      selfIntroduction: row.self_introduction,
      lookingFor: (row.looking_for as LookingFor) || undefined,
      interests: row.interests || undefined,
      expertise: row.expertise || undefined,
      projects: row.projects || undefined,
      contactPreference:
        (row.contact_preference as ContactPreference) || undefined,
      contactInfo: row.contact_info || undefined,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    })
  }
}
