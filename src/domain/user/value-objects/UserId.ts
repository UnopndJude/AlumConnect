export class UserId {
  private constructor(private readonly value: string) {}

  static create(id?: string): UserId {
    const value = id || crypto.randomUUID()
    return new UserId(value)
  }

  getValue(): string {
    return this.value
  }

  equals(other: UserId): boolean {
    return this.value === other.value
  }
}
