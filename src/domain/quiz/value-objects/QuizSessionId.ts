export class QuizSessionId {
  private constructor(private readonly value: string) {}

  static create(id?: string): QuizSessionId {
    const value = id || crypto.randomUUID()
    return new QuizSessionId(value)
  }

  getValue(): string {
    return this.value
  }

  equals(other: QuizSessionId): boolean {
    return this.value === other.value
  }
}
