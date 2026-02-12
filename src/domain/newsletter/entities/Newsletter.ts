import { NewsletterSection, NewsletterSectionProps } from "./NewsletterSection"

export type NewsletterStatus = "draft" | "published"

export interface NewsletterProps {
  id: string
  edition: number
  title: string
  sections: NewsletterSection[]
  status: NewsletterStatus
  publishedAt: Date | null
  createdAt: Date
}

export interface NewsletterPrimitives {
  id: string
  edition: number
  title: string
  sections: NewsletterSectionProps[]
  status: NewsletterStatus
  publishedAt: Date | null
  createdAt: Date
}

export class Newsletter {
  private constructor(private props: NewsletterProps) {}

  static create(
    props: Omit<NewsletterProps, "id" | "status" | "publishedAt" | "createdAt">
  ): Newsletter {
    return new Newsletter({
      ...props,
      id: crypto.randomUUID(),
      status: "draft",
      publishedAt: null,
      createdAt: new Date(),
    })
  }

  static fromPrimitives(props: NewsletterProps): Newsletter {
    return new Newsletter(props)
  }

  get id(): string {
    return this.props.id
  }

  get edition(): number {
    return this.props.edition
  }

  get title(): string {
    return this.props.title
  }

  get sections(): NewsletterSection[] {
    return this.props.sections
  }

  get status(): NewsletterStatus {
    return this.props.status
  }

  get publishedAt(): Date | null {
    return this.props.publishedAt
  }

  get createdAt(): Date {
    return this.props.createdAt
  }

  get isDraft(): boolean {
    return this.props.status === "draft"
  }

  get isPublished(): boolean {
    return this.props.status === "published"
  }

  publish(): void {
    if (this.props.status === "published") {
      throw new Error("Newsletter is already published")
    }
    if (this.props.sections.length === 0) {
      throw new Error("Newsletter must have at least one section")
    }
    this.props.status = "published"
    this.props.publishedAt = new Date()
  }

  updateTitle(title: string): void {
    if (this.isPublished) throw new Error("Cannot edit published newsletter")
    this.props.title = title
  }

  addSection(section: NewsletterSection): void {
    if (this.isPublished) throw new Error("Cannot edit published newsletter")
    this.props.sections.push(section)
  }

  removeSection(sectionId: string): void {
    if (this.isPublished) throw new Error("Cannot edit published newsletter")
    this.props.sections = this.props.sections.filter((s) => s.id !== sectionId)
  }

  toPrimitives(): NewsletterPrimitives {
    return {
      ...this.props,
      sections: this.props.sections.map((s) => s.toPrimitives()),
    }
  }
}
