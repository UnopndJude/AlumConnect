export class ProfileId {
  private constructor(private readonly value: string) {}

  static create(id?: string): ProfileId {
    const value = id || crypto.randomUUID()
    return new ProfileId(value)
  }

  getValue(): string {
    return this.value
  }

  equals(other: ProfileId): boolean {
    return this.value === other.value
  }
}
