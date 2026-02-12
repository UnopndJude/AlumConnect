import { Profile } from "../entities/Profile"
import { ProfileId } from "../value-objects"
import { Email } from "@/domain/user/value-objects"

export interface ProfileFilters {
  name?: string
  graduationClass?: number
  excludeProfileId?: string
}

export interface Pagination {
  page: number
  limit: number
}

export interface PaginatedResult<T> {
  items: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface IProfileRepository {
  findById(id: ProfileId): Promise<Profile | null>
  findByEmail(email: Email): Promise<Profile | null>
  findByAlumniId(alumniId: string): Promise<Profile | null>
  findAll(
    filters?: ProfileFilters,
    pagination?: Pagination
  ): Promise<PaginatedResult<Profile>>
  save(profile: Profile): Promise<void>
}
