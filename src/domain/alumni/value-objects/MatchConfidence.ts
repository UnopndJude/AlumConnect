export type MatchConfidenceType = "exact" | "partial" | "none"

export class MatchConfidence {
  private constructor(private readonly value: MatchConfidenceType) {}

  static exact(): MatchConfidence {
    return new MatchConfidence("exact")
  }

  static partial(): MatchConfidence {
    return new MatchConfidence("partial")
  }

  static none(): MatchConfidence {
    return new MatchConfidence("none")
  }

  getValue(): MatchConfidenceType {
    return this.value
  }

  isExact(): boolean {
    return this.value === "exact"
  }

  isMatched(): boolean {
    return this.value === "exact"
  }
}
