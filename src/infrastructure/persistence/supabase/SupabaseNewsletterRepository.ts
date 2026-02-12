import { Newsletter } from "@/domain/newsletter/entities/Newsletter"
import { NewsletterSection } from "@/domain/newsletter/entities/NewsletterSection"
import { INewsletterRepository } from "@/domain/newsletter/repositories/INewsletterRepository"
import { createServerSupabaseClient } from "@/infrastructure/supabase"

export class SupabaseNewsletterRepository implements INewsletterRepository {
  private get supabase() {
    return createServerSupabaseClient()
  }

  async save(newsletter: Newsletter): Promise<void> {
    const primitives = newsletter.toPrimitives()

    // Save newsletter
    const { error: newsletterError } = await this.supabase
      .from("newsletters")
      .upsert({
        id: primitives.id,
        edition: primitives.edition,
        title: primitives.title,
        status: primitives.status,
        published_at: primitives.publishedAt?.toISOString() || null,
        created_at: primitives.createdAt.toISOString(),
      })

    if (newsletterError) {
      throw new Error(`Failed to save newsletter: ${newsletterError.message}`)
    }

    // Delete existing sections
    const { error: deleteError } = await this.supabase
      .from("newsletter_sections")
      .delete()
      .eq("newsletter_id", primitives.id)

    if (deleteError) {
      throw new Error(`Failed to delete sections: ${deleteError.message}`)
    }

    // Insert sections
    if (primitives.sections.length > 0) {
      const { error: sectionsError } = await this.supabase
        .from("newsletter_sections")
        .insert(
          primitives.sections.map((section) => ({
            id: section.id,
            newsletter_id: primitives.id,
            type: section.type,
            title: section.title,
            content: section.content,
            display_order: section.order,
          }))
        )

      if (sectionsError) {
        throw new Error(`Failed to save sections: ${sectionsError.message}`)
      }
    }
  }

  async findById(id: string): Promise<Newsletter | null> {
    const { data: newsletterData, error: newsletterError } = await this.supabase
      .from("newsletters")
      .select("*")
      .eq("id", id)
      .single()

    if (newsletterError || !newsletterData) return null

    const { data: sectionsData, error: sectionsError } = await this.supabase
      .from("newsletter_sections")
      .select("*")
      .eq("newsletter_id", id)
      .order("display_order", { ascending: true })

    if (sectionsError) return null

    return this.toDomain(newsletterData, sectionsData || [])
  }

  async findByEdition(edition: number): Promise<Newsletter | null> {
    const { data: newsletterData, error: newsletterError } = await this.supabase
      .from("newsletters")
      .select("*")
      .eq("edition", edition)
      .single()

    if (newsletterError || !newsletterData) return null

    const { data: sectionsData, error: sectionsError } = await this.supabase
      .from("newsletter_sections")
      .select("*")
      .eq("newsletter_id", newsletterData.id)
      .order("display_order", { ascending: true })

    if (sectionsError) return null

    return this.toDomain(newsletterData, sectionsData || [])
  }

  async findAll(): Promise<Newsletter[]> {
    const { data: newslettersData, error: newslettersError } =
      await this.supabase
        .from("newsletters")
        .select("*")
        .order("edition", { ascending: false })

    if (newslettersError || !newslettersData) return []

    const newsletters: Newsletter[] = []

    for (const newsletterData of newslettersData) {
      const { data: sectionsData, error: sectionsError } = await this.supabase
        .from("newsletter_sections")
        .select("*")
        .eq("newsletter_id", newsletterData.id)
        .order("display_order", { ascending: true })

      if (sectionsError) continue

      const newsletter = this.toDomain(newsletterData, sectionsData || [])
      if (newsletter) newsletters.push(newsletter)
    }

    return newsletters
  }

  async findAllPublished(): Promise<Newsletter[]> {
    const { data: newslettersData, error: newslettersError } =
      await this.supabase
        .from("newsletters")
        .select("*")
        .eq("status", "published")
        .order("edition", { ascending: false })

    if (newslettersError || !newslettersData) return []

    const newsletters: Newsletter[] = []

    for (const newsletterData of newslettersData) {
      const { data: sectionsData, error: sectionsError } = await this.supabase
        .from("newsletter_sections")
        .select("*")
        .eq("newsletter_id", newsletterData.id)
        .order("display_order", { ascending: true })

      if (sectionsError) continue

      const newsletter = this.toDomain(newsletterData, sectionsData || [])
      if (newsletter) newsletters.push(newsletter)
    }

    return newsletters
  }

  async findDrafts(): Promise<Newsletter[]> {
    const { data: newslettersData, error: newslettersError } =
      await this.supabase
        .from("newsletters")
        .select("*")
        .eq("status", "draft")
        .order("edition", { ascending: false })

    if (newslettersError || !newslettersData) return []

    const newsletters: Newsletter[] = []

    for (const newsletterData of newslettersData) {
      const { data: sectionsData, error: sectionsError } = await this.supabase
        .from("newsletter_sections")
        .select("*")
        .eq("newsletter_id", newsletterData.id)
        .order("display_order", { ascending: true })

      if (sectionsError) continue

      const newsletter = this.toDomain(newsletterData, sectionsData || [])
      if (newsletter) newsletters.push(newsletter)
    }

    return newsletters
  }

  async getNextEditionNumber(): Promise<number> {
    const { data, error } = await this.supabase
      .from("newsletters")
      .select("edition")
      .order("edition", { ascending: false })
      .limit(1)
      .single()

    if (error || !data) return 1

    return data.edition + 1
  }

  async delete(id: string): Promise<void> {
    // Delete sections first (foreign key constraint)
    await this.supabase
      .from("newsletter_sections")
      .delete()
      .eq("newsletter_id", id)

    // Then delete newsletter
    const { error } = await this.supabase
      .from("newsletters")
      .delete()
      .eq("id", id)

    if (error) {
      throw new Error(`Failed to delete newsletter: ${error.message}`)
    }
  }

  private toDomain(
    newsletterRow: {
      id: string
      edition: number
      title: string
      status: string
      published_at: string | null
      created_at: string
    },
    sectionRows: Array<{
      id: string
      newsletter_id: string
      type: string
      title: string
      content: string
      display_order: number
      created_at: string
    }>
  ): Newsletter | null {
    const sections = sectionRows.map((row) =>
      NewsletterSection.fromPrimitives({
        id: row.id,
        type: row.type as
          | "alumni_in_media"
          | "member_announcements"
          | "industry_trends",
        title: row.title,
        content: row.content,
        order: row.display_order,
      })
    )

    return Newsletter.fromPrimitives({
      id: newsletterRow.id,
      edition: newsletterRow.edition,
      title: newsletterRow.title,
      sections,
      status: newsletterRow.status as "draft" | "published",
      publishedAt: newsletterRow.published_at
        ? new Date(newsletterRow.published_at)
        : null,
      createdAt: new Date(newsletterRow.created_at),
    })
  }
}
