import { ValidationError } from "@/shared/errors/DomainError"
import { Result } from "@/shared/types/Result"

export class GraduationClass {
  private static readonly MIN = 1
  private static readonly MAX = 50

  private constructor(private readonly value: number) {}

  static create(classNumber: number): Result<GraduationClass, ValidationError> {
    if (
      !Number.isInteger(classNumber) ||
      classNumber < this.MIN ||
      classNumber > this.MAX
    ) {
      return Result.fail(
        new ValidationError(
          `기수는 ${this.MIN}기부터 ${this.MAX}기까지 입력 가능합니다.`
        )
      )
    }

    return Result.ok(new GraduationClass(classNumber))
  }

  getValue(): number {
    return this.value
  }

  equals(other: GraduationClass): boolean {
    return this.value === other.value
  }
}
