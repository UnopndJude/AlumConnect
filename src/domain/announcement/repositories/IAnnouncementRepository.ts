import { Announcement } from "../entities/Announcement"

export interface IAnnouncementRepository {
  save(announcement: Announcement): Promise<void>
  findById(id: string): Promise<Announcement | null>
  findByAuthorId(authorId: string): Promise<Announcement[]>
  findPending(): Promise<Announcement[]>
  findApproved(): Promise<Announcement[]>
  delete(id: string): Promise<void>
}
