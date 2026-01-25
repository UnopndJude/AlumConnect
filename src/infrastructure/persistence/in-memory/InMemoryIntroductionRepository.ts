import { Introduction } from "@/domain/introduction/entities/Introduction"
import { IIntroductionRepository } from "@/domain/introduction/repositories/IIntroductionRepository"
import { UserId } from "@/domain/user/value-objects"

const introductions: Map<string, Introduction> = new Map()

export class InMemoryIntroductionRepository implements IIntroductionRepository {
  async findById(id: string): Promise<Introduction | null> {
    return introductions.get(id) || null
  }

  async findByUserId(userId: UserId): Promise<Introduction | null> {
    for (const intro of introductions.values()) {
      if (intro.userId.equals(userId)) {
        return intro
      }
    }
    return null
  }

  async findAll(): Promise<Introduction[]> {
    return Array.from(introductions.values()).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    )
  }

  async findByGraduationClass(
    graduationClass: number
  ): Promise<Introduction[]> {
    return Array.from(introductions.values())
      .filter((intro) => intro.graduationClass === graduationClass)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  }

  async search(query: string): Promise<Introduction[]> {
    const lowerQuery = query.toLowerCase()
    return Array.from(introductions.values())
      .filter(
        (intro) =>
          intro.name.toLowerCase().includes(lowerQuery) ||
          intro.field?.toLowerCase().includes(lowerQuery) ||
          intro.organization?.toLowerCase().includes(lowerQuery) ||
          intro.selfIntroduction.toLowerCase().includes(lowerQuery)
      )
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  }

  async save(introduction: Introduction): Promise<void> {
    introductions.set(introduction.id, introduction)
  }

  async delete(id: string): Promise<boolean> {
    return introductions.delete(id)
  }
}
