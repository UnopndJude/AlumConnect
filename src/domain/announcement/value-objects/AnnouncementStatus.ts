export type AnnouncementStatus = "pending" | "approved" | "rejected"

export class AnnouncementStatusVO {
  private static readonly VALID_STATUSES: AnnouncementStatus[] = [
    "pending",
    "approved",
    "rejected",
  ]

  private constructor(private readonly value: AnnouncementStatus) {}

  static create(value: string): AnnouncementStatusVO {
    if (!this.VALID_STATUSES.includes(value as AnnouncementStatus)) {
      throw new Error(
        `Invalid announcement status: ${value}. Must be one of: ${this.VALID_STATUSES.join(", ")}`
      )
    }
    return new AnnouncementStatusVO(value as AnnouncementStatus)
  }

  static pending(): AnnouncementStatusVO {
    return new AnnouncementStatusVO("pending")
  }

  getValue(): AnnouncementStatus {
    return this.value
  }

  isPending(): boolean {
    return this.value === "pending"
  }

  isApproved(): boolean {
    return this.value === "approved"
  }

  isRejected(): boolean {
    return this.value === "rejected"
  }
}
