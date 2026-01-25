export class QuizScore {
  private constructor(
    private readonly correct: number,
    private readonly total: number,
    private readonly passingScore: number
  ) {}

  static create(
    correct: number,
    total: number,
    passingScore: number
  ): QuizScore {
    return new QuizScore(correct, total, passingScore)
  }

  getCorrect(): number {
    return this.correct
  }

  getTotal(): number {
    return this.total
  }

  passed(): boolean {
    return this.correct >= this.passingScore
  }

  getPercentage(): number {
    return Math.round((this.correct / this.total) * 100)
  }
}
