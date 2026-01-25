export class UserId {
  private constructor(private readonly value: string) {}

  static create(id?: string): UserId {
    const value =
      id || `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    return new UserId(value)
  }

  getValue(): string {
    return this.value
  }

  equals(other: UserId): boolean {
    return this.value === other.value
  }
}
