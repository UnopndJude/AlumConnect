import { Newsletter } from "../entities/Newsletter"

export interface INewsletterRepository {
  save(newsletter: Newsletter): Promise<void>
  findById(id: string): Promise<Newsletter | null>
  findByEdition(edition: number): Promise<Newsletter | null>
  findAll(): Promise<Newsletter[]>
  findAllPublished(): Promise<Newsletter[]>
  findDrafts(): Promise<Newsletter[]>
  getNextEditionNumber(): Promise<number>
  delete(id: string): Promise<void>
}
