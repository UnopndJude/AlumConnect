import { IUserRepository } from "@/domain/user/repositories/IUserRepository"
import { UserId } from "@/domain/user/value-objects"
import { Result } from "@/shared/types/Result"
import { DomainError, NotFoundError } from "@/shared/errors/DomainError"
import { UserResponseDto, toUserResponseDto } from "../dtos/UserDto"

export class ApproveUserUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(userId: string): Promise<Result<UserResponseDto, DomainError>> {
    const user = await this.userRepository.findById(UserId.create(userId))
    if (!user) {
      return Result.fail(new NotFoundError("사용자"))
    }

    user.approve()
    await this.userRepository.save(user)

    return Result.ok(toUserResponseDto(user))
  }
}

export class RejectUserUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(userId: string): Promise<Result<UserResponseDto, DomainError>> {
    const user = await this.userRepository.findById(UserId.create(userId))
    if (!user) {
      return Result.fail(new NotFoundError("사용자"))
    }

    user.reject()
    await this.userRepository.save(user)

    return Result.ok(toUserResponseDto(user))
  }
}

export class GetPendingUsersUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(): Promise<UserResponseDto[]> {
    const users = await this.userRepository.findPending()
    return users.map(toUserResponseDto)
  }
}
