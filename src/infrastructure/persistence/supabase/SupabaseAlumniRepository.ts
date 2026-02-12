import { Alumni } from "@/domain/alumni/entities/Alumni"
import { IAlumniRepository } from "@/domain/alumni/repositories/IAlumniRepository"
import { AlumniId } from "@/domain/alumni/value-objects"
import { GraduationClass } from "@/domain/user/value-objects"
import { createServerSupabaseClient } from "@/infrastructure/supabase"

export class SupabaseAlumniRepository implements IAlumniRepository {
  private get supabase() {
    return createServerSupabaseClient()
  }

  async findById(id: AlumniId): Promise<Alumni | null> {
    const { data, error } = await this.supabase
      .from("alumni")
      .select("*")
      .eq("id", id.getValue())
      .single()

    if (error || !data) return null
    return this.toDomain(data)
  }

  async findByNameAndClass(
    name: string,
    graduationClass: GraduationClass
  ): Promise<Alumni | null> {
    const { data, error } = await this.supabase
      .from("alumni")
      .select("*")
      .eq("name", name)
      .eq("graduation_class", graduationClass.getValue())
      .eq("is_registered", false)
      .single()

    if (error || !data) return null
    return this.toDomain(data)
  }

  async findByName(name: string): Promise<Alumni | null> {
    const { data, error } = await this.supabase
      .from("alumni")
      .select("*")
      .eq("name", name)
      .eq("is_registered", false)
      .limit(1)
      .single()

    if (error || !data) return null
    return this.toDomain(data)
  }

  async save(alumni: Alumni): Promise<void> {
    const primitives = alumni.toPrimitives()

    const { error } = await this.supabase.from("alumni").upsert({
      id: primitives.id,
      name: primitives.name,
      graduation_class: primitives.graduationClass,
      birth_year: primitives.birthYear || null,
      is_registered: primitives.isRegistered,
    })

    if (error) {
      throw new Error(`Failed to save alumni: ${error.message}`)
    }
  }

  async findAll(): Promise<Alumni[]> {
    const { data, error } = await this.supabase.from("alumni").select("*")

    if (error || !data) return []
    return data.map((row) => this.toDomain(row)).filter(Boolean) as Alumni[]
  }

  private toDomain(row: {
    id: string
    name: string
    graduation_class: number
    birth_year: number | null
    is_registered: boolean
  }): Alumni | null {
    const gradClassResult = GraduationClass.create(row.graduation_class)
    if (!gradClassResult.success) return null

    return Alumni.reconstitute({
      id: AlumniId.create(row.id),
      name: row.name,
      graduationClass: gradClassResult.value,
      birthYear: row.birth_year || undefined,
      isRegistered: row.is_registered,
    })
  }
}
