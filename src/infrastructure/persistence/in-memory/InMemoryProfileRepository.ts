import { Profile } from "@/domain/profile/entities/Profile"
import {
  IProfileRepository,
  ProfileFilters,
  Pagination,
  PaginatedResult,
} from "@/domain/profile/repositories/IProfileRepository"
import { ProfileId } from "@/domain/profile/value-objects"
import { Email } from "@/domain/user/value-objects"

const profiles: Map<string, Profile> = new Map()

export class InMemoryProfileRepository implements IProfileRepository {
  async findById(id: ProfileId): Promise<Profile | null> {
    return profiles.get(id.getValue()) || null
  }

  async findByEmail(email: Email): Promise<Profile | null> {
    for (const profile of profiles.values()) {
      if (profile.email.equals(email)) {
        return profile
      }
    }
    return null
  }

  async findByAlumniId(alumniId: string): Promise<Profile | null> {
    for (const profile of profiles.values()) {
      if (profile.alumniId === alumniId) {
        return profile
      }
    }
    return null
  }

  async findAll(
    filters?: ProfileFilters,
    pagination?: Pagination
  ): Promise<PaginatedResult<Profile>> {
    let filteredProfiles = Array.from(profiles.values())

    // Apply filters
    if (filters?.name) {
      const searchTerm = filters.name.toLowerCase()
      filteredProfiles = filteredProfiles.filter((p) =>
        p.name.toLowerCase().includes(searchTerm)
      )
    }

    if (filters?.graduationClass) {
      filteredProfiles = filteredProfiles.filter(
        (p) => p.graduationClass.getValue() === filters.graduationClass
      )
    }

    if (filters?.excludeProfileId) {
      filteredProfiles = filteredProfiles.filter(
        (p) => p.id.getValue() !== filters.excludeProfileId
      )
    }

    const total = filteredProfiles.length

    // Apply pagination
    const page = pagination?.page || 1
    const limit = pagination?.limit || 20
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit

    const paginatedItems = filteredProfiles.slice(startIndex, endIndex)

    return {
      items: paginatedItems,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    }
  }

  async save(profile: Profile): Promise<void> {
    profiles.set(profile.id.getValue(), profile)
  }
}
