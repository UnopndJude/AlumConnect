export type AnnouncementType =
  | "academic"
  | "career"
  | "event"
  | "news"
  | "other"

export class AnnouncementTypeVO {
  private static readonly VALID_TYPES: AnnouncementType[] = [
    "academic",
    "career",
    "event",
    "news",
    "other",
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
