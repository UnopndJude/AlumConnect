export type DifficultyValue = "easy" | "medium" | "hard"

export class Difficulty {
  private constructor(private readonly value: DifficultyValue) {}

  static easy(): Difficulty {
    return new Difficulty("easy")
  }

  static medium(): Difficulty {
    return new Difficulty("medium")
  }

  static hard(): Difficulty {
    return new Difficulty("hard")
  }

  static fromString(value: DifficultyValue): Difficulty {
    return new Difficulty(value)
  }

  getValue(): DifficultyValue {
    return this.value
  }
}
