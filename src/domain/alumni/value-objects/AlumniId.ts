export class AlumniId {
  private constructor(private readonly value: string) {}

  static create(id?: string): AlumniId {
    const value = id || crypto.randomUUID()
    return new AlumniId(value)
  }

  getValue(): string {
    return this.value
  }

  equals(other: AlumniId): boolean {
    return this.value === other.value
  }
}
