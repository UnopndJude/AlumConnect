export type QuestionTypeValue =
  | "basic"
  | "facility"
  | "culture"
  | "class_specific"

export class QuestionType {
  private constructor(private readonly value: QuestionTypeValue) {}

  static basic(): QuestionType {
    return new QuestionType("basic")
  }

  static facility(): QuestionType {
    return new QuestionType("facility")
  }

  static culture(): QuestionType {
    return new QuestionType("culture")
  }

  static classSpecific(): QuestionType {
    return new QuestionType("class_specific")
  }

  static fromString(value: QuestionTypeValue): QuestionType {
    return new QuestionType(value)
  }

  getValue(): QuestionTypeValue {
    return this.value
  }
}
