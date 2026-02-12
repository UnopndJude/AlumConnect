export class QuizQuestionId {
  private constructor(private readonly value: string) {}

  static create(id?: string): QuizQuestionId {
    const value = id || crypto.randomUUID()
    return new QuizQuestionId(value)
  }

  getValue(): string {
    return this.value
  }

  equals(other: QuizQuestionId): boolean {
    return this.value === other.value
  }
}
