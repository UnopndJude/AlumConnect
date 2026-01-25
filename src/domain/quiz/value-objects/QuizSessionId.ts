export class QuizSessionId {
  private constructor(private readonly value: string) {}

  static create(id?: string): QuizSessionId {
    const value =
      id || `quiz-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    return new QuizSessionId(value)
  }

  getValue(): string {
    return this.value
  }

  equals(other: QuizSessionId): boolean {
    return this.value === other.value
  }
}
