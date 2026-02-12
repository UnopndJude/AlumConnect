import { Announcement } from "@/domain/announcement/entities/Announcement"
import { IAnnouncementRepository } from "@/domain/announcement/repositories/IAnnouncementRepository"
import { createServerSupabaseClient } from "@/infrastructure/supabase"

export class SupabaseAnnouncementRepository
  implements IAnnouncementRepository
{
  private get supabase() {
    return createServerSupabaseClient()
  }

  async save(announcement: Announcement): Promise<void> {
    const primitives = announcement.toPrimitives()

    const { error } = await this.supabase.from("announcements").upsert({
      id: primitives.id,
      author_id: primitives.authorId,
      type: primitives.type,
      title: primitives.title,
      content: primitives.content,
      status: primitives.status,
      reviewed_by: primitives.reviewedBy,
      reviewed_at: primitives.reviewedAt?.toISOString() || null,
      rejection_reason: primitives.rejectionReason,
      created_at: primitives.createdAt.toISOString(),
    })

    if (error) {
      throw new Error(`Failed to save announcement: ${error.message}`)
    }
  }

  async findById(id: string): Promise<Announcement | null> {
    const { data, error } = await this.supabase
      .from("announcements")
      .select("*")
      .eq("id", id)
      .single()

    if (error || !data) return null

    return this.toDomain(data)
  }

  async findByAuthorId(authorId: string): Promise<Announcement[]> {
    const { data, error } = await this.supabase
      .from("announcements")
      .select("*")
      .eq("author_id", authorId)
      .order("created_at", { ascending: false })

    if (error || !data) return []

    return data.map((row) => this.toDomain(row))
  }

  async findPending(): Promise<Announcement[]> {
    const { data, error } = await this.supabase
      .from("announcements")
      .select("*")
      .eq("status", "pending")
      .order("created_at", { ascending: true })

    if (error || !data) return []

    return data.map((row) => this.toDomain(row))
  }

  async findApproved(): Promise<Announcement[]> {
    const { data, error } = await this.supabase
      .from("announcements")
      .select("*")
      .eq("status", "approved")
      .order("created_at", { ascending: false })

    if (error || !data) return []

    return data.map((row) => this.toDomain(row))
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from("announcements")
      .delete()
      .eq("id", id)

    if (error) {
      throw new Error(`Failed to delete announcement: ${error.message}`)
    }
  }

  private toDomain(row: {
    id: string
    author_id: string
    type: string
    title: string
    content: string
    status: string
    reviewed_by: string | null
    reviewed_at: string | null
    rejection_reason: string | null
    created_at: string
  }): Announcement {
    return Announcement.fromPrimitives({
      id: row.id,
      authorId: row.author_id,
      type: row.type as
        | "alumni_in_media"
        | "member_announcements"
        | "industry_trends",
      title: row.title,
      content: row.content,
      status: row.status as "pending" | "approved" | "rejected",
      reviewedBy: row.reviewed_by,
      reviewedAt: row.reviewed_at ? new Date(row.reviewed_at) : null,
      rejectionReason: row.rejection_reason,
      createdAt: new Date(row.created_at),
    })
  }
}
