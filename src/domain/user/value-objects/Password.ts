import { ValidationError } from "@/shared/errors/DomainError"
import { Result } from "@/shared/types/Result"

export interface PasswordHasher {
  hash(plain: string): Promise<string>
  verify(plain: string, hashed: string): Promise<boolean>
}

export class Password {
  private constructor(
    private readonly hashedValue: string,
    private readonly isHashed: boolean
  ) {}

  static createFromPlain(
    plain: string
  ): Result<
    { password: Password; needsHashing: true; plainValue: string },
    ValidationError
  > {
    if (!plain || plain.length < 6) {
      return Result.fail(
        new ValidationError("비밀번호는 6자 이상이어야 합니다.")
      )
    }

    return Result.ok({
      password: new Password(plain, false),
      needsHashing: true,
      plainValue: plain,
    })
  }

  static createFromHashed(hashedValue: string): Password {
    return new Password(hashedValue, true)
  }

  getValue(): string {
    return this.hashedValue
  }

  isAlreadyHashed(): boolean {
    return this.isHashed
  }
}
