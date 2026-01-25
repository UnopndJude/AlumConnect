import { IUserRepository } from "@/domain/user/repositories/IUserRepository"
import { PasswordHasher } from "@/domain/user/value-objects"
import { Result } from "@/shared/types/Result"
import {
  DomainError,
  UnauthorizedError,
  ForbiddenError,
} from "@/shared/errors/DomainError"
import {
  LoginUserDto,
  UserResponseDto,
  toUserResponseDto,
} from "../dtos/UserDto"

export class LoginUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly passwordHasher: PasswordHasher
  ) {}

  async execute(
    dto: LoginUserDto
  ): Promise<Result<UserResponseDto, DomainError>> {
    if (!dto.email || !dto.password) {
      return Result.fail(
        new UnauthorizedError("이메일과 비밀번호를 입력해주세요.")
      )
    }

    const user = await this.userRepository.findByEmailString(dto.email)
    if (!user) {
      return Result.fail(new UnauthorizedError("등록되지 않은 이메일입니다."))
    }

    const passwordValid = await this.passwordHasher.verify(
      dto.password,
      user.password.getValue()
    )
    if (!passwordValid) {
      return Result.fail(new UnauthorizedError("비밀번호가 일치하지 않습니다."))
    }

    if (!user.canLogin()) {
      if (user.status.isPending()) {
        return Result.fail(
          new ForbiddenError("아직 관리자의 승인을 기다리고 있습니다.")
        )
      }
      if (user.status.isRejected()) {
        return Result.fail(
          new ForbiddenError(
            "회원가입이 거부되었습니다. 관리자에게 문의해주세요."
          )
        )
      }
      return Result.fail(new ForbiddenError("로그인할 수 없습니다."))
    }

    return Result.ok(toUserResponseDto(user))
  }
}
