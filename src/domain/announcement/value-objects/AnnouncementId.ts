export class AnnouncementId {
  private constructor(private readonly value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error("AnnouncementId cannot be empty")
    }
  }

  static create(value?: string): AnnouncementId {
    return new AnnouncementId(value || crypto.randomUUID())
  }

  getValue(): string {
    return this.value
  }

  equals(other: AnnouncementId): boolean {
    return this.value === other.value
  }
}
