export type AnnouncementType =
  | "alumni_in_media"
  | "member_announcements"
  | "industry_trends"

export class AnnouncementTypeVO {
  private static readonly VALID_TYPES: AnnouncementType[] = [
    "alumni_in_media",
    "member_announcements",
    "industry_trends",
  ]

  private constructor(private readonly value: AnnouncementType) {}

  static create(value: string): AnnouncementTypeVO {
    if (!this.VALID_TYPES.includes(value as AnnouncementType)) {
      throw new Error(
        `Invalid announcement type: ${value}. Must be one of: ${this.VALID_TYPES.join(", ")}`
      )
    }
    return new AnnouncementTypeVO(value as AnnouncementType)
  }

  getValue(): AnnouncementType {
    return this.value
  }
}
