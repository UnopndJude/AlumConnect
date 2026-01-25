import { ValidationError } from "@/shared/errors/DomainError"
import { Result } from "@/shared/types/Result"

export class Email {
  private constructor(private readonly value: string) {}

  static create(email: string): Result<Email, ValidationError> {
    const trimmed = email.trim().toLowerCase()

    if (!trimmed) {
      return Result.fail(new ValidationError("이메일을 입력해주세요."))
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(trimmed)) {
      return Result.fail(new ValidationError("올바른 이메일 형식이 아닙니다."))
    }

    return Result.ok(new Email(trimmed))
  }

  getValue(): string {
    return this.value
  }

  equals(other: Email): boolean {
    return this.value === other.value
  }
}
