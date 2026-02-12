import { Newsletter } from "@/domain/newsletter/entities/Newsletter"
import { INewsletterRepository } from "@/domain/newsletter/repositories/INewsletterRepository"

const newsletters: Map<string, Newsletter> = new Map()

export class InMemoryNewsletterRepository implements INewsletterRepository {
  async save(newsletter: Newsletter): Promise<void> {
    newsletters.set(newsletter.id, newsletter)
  }

  async findById(id: string): Promise<Newsletter | null> {
    return newsletters.get(id) || null
  }

  async findByEdition(edition: number): Promise<Newsletter | null> {
    for (const newsletter of newsletters.values()) {
      if (newsletter.edition === edition) {
        return newsletter
      }
    }
    return null
  }

  async findAll(): Promise<Newsletter[]> {
    return Array.from(newsletters.values()).sort(
      (a, b) => b.edition - a.edition
    )
  }

  async findAllPublished(): Promise<Newsletter[]> {
    return Array.from(newsletters.values())
      .filter((n) => n.isPublished)
      .sort((a, b) => b.edition - a.edition)
  }

  async findDrafts(): Promise<Newsletter[]> {
    return Array.from(newsletters.values())
      .filter((n) => n.isDraft)
      .sort((a, b) => b.edition - a.edition)
  }

  async getNextEditionNumber(): Promise<number> {
    if (newsletters.size === 0) return 1

    let maxEdition = 0
    for (const newsletter of newsletters.values()) {
      if (newsletter.edition > maxEdition) {
        maxEdition = newsletter.edition
      }
    }
    return maxEdition + 1
  }

  async delete(id: string): Promise<void> {
    newsletters.delete(id)
  }
}
