export type SectionType =
  | "alumni_in_media"
  | "member_announcements"
  | "industry_trends"

export interface NewsletterSectionProps {
  id: string
  type: SectionType
  title: string
  content: string
  order: number
}

export class NewsletterSection {
  private constructor(private props: NewsletterSectionProps) {}

  static create(props: Omit<NewsletterSectionProps, "id">): NewsletterSection {
    return new NewsletterSection({
      ...props,
      id: crypto.randomUUID(),
    })
  }

  static fromPrimitives(props: NewsletterSectionProps): NewsletterSection {
    return new NewsletterSection(props)
  }

  get id(): string {
    return this.props.id
  }

  get type(): SectionType {
    return this.props.type
  }

  get title(): string {
    return this.props.title
  }

  get content(): string {
    return this.props.content
  }

  get order(): number {
    return this.props.order
  }

  updateContent(title: string, content: string): void {
    this.props.title = title
    this.props.content = content
  }

  toPrimitives(): NewsletterSectionProps {
    return { ...this.props }
  }
}
