export type AnnouncementStatus = "pending" | "approved" | "rejected"
export type AnnouncementType =
  | "alumni_in_media"
  | "member_announcements"
  | "industry_trends"

export interface AnnouncementProps {
  id: string
  authorId: string
  type: AnnouncementType
  title: string
  content: string
  status: AnnouncementStatus
  reviewedBy: string | null
  reviewedAt: Date | null
  rejectionReason: string | null
  createdAt: Date
}

export interface AnnouncementPrimitives {
  id: string
  authorId: string
  type: AnnouncementType
  title: string
  content: string
  status: AnnouncementStatus
  reviewedBy: string | null
  reviewedAt: Date | null
  rejectionReason: string | null
  createdAt: Date
}

export class Announcement {
  private constructor(private props: AnnouncementProps) {}

  static create(
    props: Omit<
      AnnouncementProps,
      | "id"
      | "status"
      | "reviewedBy"
      | "reviewedAt"
      | "rejectionReason"
      | "createdAt"
    >
  ): Announcement {
    return new Announcement({
      ...props,
      id: crypto.randomUUID(),
      status: "pending",
      reviewedBy: null,
      reviewedAt: null,
      rejectionReason: null,
      createdAt: new Date(),
    })
  }

  static fromPrimitives(props: AnnouncementProps): Announcement {
    return new Announcement(props)
  }

  get id(): string {
    return this.props.id
  }

  get authorId(): string {
    return this.props.authorId
  }

  get type(): AnnouncementType {
    return this.props.type
  }

  get title(): string {
    return this.props.title
  }

  get content(): string {
    return this.props.content
  }

  get status(): AnnouncementStatus {
    return this.props.status
  }

  get reviewedBy(): string | null {
    return this.props.reviewedBy
  }

  get reviewedAt(): Date | null {
    return this.props.reviewedAt
      ? new Date(this.props.reviewedAt.getTime())
      : null
  }

  get rejectionReason(): string | null {
    return this.props.rejectionReason
  }

  get createdAt(): Date {
    return new Date(this.props.createdAt.getTime())
  }

  get isPending(): boolean {
    return this.props.status === "pending"
  }

  get isApproved(): boolean {
    return this.props.status === "approved"
  }

  get isRejected(): boolean {
    return this.props.status === "rejected"
  }

  approve(adminId: string): void {
    if (this.props.status !== "pending") {
      throw new Error("Only pending announcements can be approved")
    }
    this.props.status = "approved"
    this.props.reviewedBy = adminId
    this.props.reviewedAt = new Date()
    this.props.rejectionReason = null
  }

  reject(adminId: string, reason: string): void {
    if (this.props.status !== "pending") {
      throw new Error("Only pending announcements can be rejected")
    }
    if (!reason || reason.trim().length === 0) {
      throw new Error("Rejection reason is required")
    }
    this.props.status = "rejected"
    this.props.reviewedBy = adminId
    this.props.reviewedAt = new Date()
    this.props.rejectionReason = reason
  }

  canBeDeletedBy(profileId: string): boolean {
    return this.isPending && this.props.authorId === profileId
  }

  toPrimitives(): AnnouncementPrimitives {
    return { ...this.props }
  }
}
