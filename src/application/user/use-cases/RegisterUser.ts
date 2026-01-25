import { User } from "@/domain/user/entities/User"
import { IUserRepository } from "@/domain/user/repositories/IUserRepository"
import {
  Email,
  Password,
  GraduationClass,
  UserStatus,
  PasswordHasher,
} from "@/domain/user/value-objects"
import { Result } from "@/shared/types/Result"
import { ValidationError, DomainError } from "@/shared/errors/DomainError"
import {
  RegisterUserDto,
  UserResponseDto,
  toUserResponseDto,
} from "../dtos/UserDto"

export interface RegisterUserResult {
  user: UserResponseDto
  autoApproved: boolean
}

export class RegisterUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly passwordHasher: PasswordHasher
  ) {}

  async execute(
    dto: RegisterUserDto,
    options: { autoApprove?: boolean } = {}
  ): Promise<Result<RegisterUserResult, DomainError>> {
    // Validate email
    const emailResult = Email.create(dto.email)
    if (!emailResult.success) {
      return Result.fail(emailResult.error)
    }

    // Check duplicate email
    const existingUser = await this.userRepository.findByEmail(
      emailResult.value
    )
    if (existingUser) {
      return Result.fail(new ValidationError("이미 등록된 이메일입니다."))
    }

    // Validate password
    const passwordResult = Password.createFromPlain(dto.password)
    if (!passwordResult.success) {
      return Result.fail(passwordResult.error)
    }

    // Validate graduation class
    const graduationClassResult = GraduationClass.create(dto.graduationClass)
    if (!graduationClassResult.success) {
      return Result.fail(graduationClassResult.error)
    }

    // Hash password
    const hashedPassword = await this.passwordHasher.hash(
      passwordResult.value.plainValue
    )

    // Create user
    const status = options.autoApprove
      ? UserStatus.approved()
      : UserStatus.pending()

    const user = User.create({
      email: emailResult.value,
      password: Password.createFromHashed(hashedPassword),
      name: dto.name,
      graduationClass: graduationClassResult.value,
      status,
    })

    if (options.autoApprove) {
      user.approve()
    }

    await this.userRepository.save(user)

    return Result.ok({
      user: toUserResponseDto(user),
      autoApproved: options.autoApprove || false,
    })
  }
}
