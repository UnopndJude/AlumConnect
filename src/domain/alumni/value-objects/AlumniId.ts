export class AlumniId {
  private constructor(private readonly value: string) {}

  static create(id?: string): AlumniId {
    const value =
      id || `alumni-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    return new AlumniId(value)
  }

  getValue(): string {
    return this.value
  }

  equals(other: AlumniId): boolean {
    return this.value === other.value
  }
}
