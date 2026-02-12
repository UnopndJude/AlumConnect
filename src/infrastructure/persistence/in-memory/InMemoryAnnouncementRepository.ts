import { Announcement } from "@/domain/announcement/entities/Announcement"
import { IAnnouncementRepository } from "@/domain/announcement/repositories/IAnnouncementRepository"

const announcements: Map<string, Announcement> = new Map()

export class InMemoryAnnouncementRepository
  implements IAnnouncementRepository
{
  async save(announcement: Announcement): Promise<void> {
    announcements.set(announcement.id, announcement)
  }

  async findById(id: string): Promise<Announcement | null> {
    return announcements.get(id) || null
  }

  async findByAuthorId(authorId: string): Promise<Announcement[]> {
    return Array.from(announcements.values())
      .filter((a) => a.authorId === authorId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  }

  async findPending(): Promise<Announcement[]> {
    return Array.from(announcements.values())
      .filter((a) => a.isPending)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
  }

  async findApproved(): Promise<Announcement[]> {
    return Array.from(announcements.values())
      .filter((a) => a.isApproved)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  }

  async delete(id: string): Promise<void> {
    announcements.delete(id)
  }
}
