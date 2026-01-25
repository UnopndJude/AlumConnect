import { Introduction } from "@/domain/introduction/entities/Introduction"
import { IIntroductionRepository } from "@/domain/introduction/repositories/IIntroductionRepository"
import { IUserRepository } from "@/domain/user/repositories/IUserRepository"
import { UserId } from "@/domain/user/value-objects"
import { Result } from "@/shared/types/Result"
import {
  ValidationError,
  NotFoundError,
  ForbiddenError,
  DomainError,
} from "@/shared/errors/DomainError"

export interface CreateIntroductionDto {
  userId: string
  name: string
  graduationClass: number
  status: Introduction["status"]
  field?: string
  organization?: string
  location?: string
  selfIntroduction: string
  lookingFor?: Introduction["lookingFor"]
  interests?: string
  expertise?: string
  projects?: string
  contactPreference?: Introduction["contactPreference"]
  contactInfo?: string
}

export class CreateIntroductionUseCase {
  constructor(
    private readonly introductionRepository: IIntroductionRepository,
    private readonly userRepository: IUserRepository
  ) {}

  async execute(
    dto: CreateIntroductionDto
  ): Promise<Result<ReturnType<Introduction["toPrimitives"]>, DomainError>> {
    const userId = UserId.create(dto.userId)
    const user = await this.userRepository.findById(userId)

    if (!user) {
      return Result.fail(new NotFoundError("사용자"))
    }

    if (!user.status.isApproved()) {
      return Result.fail(
        new ForbiddenError("승인된 사용자만 작성할 수 있습니다.")
      )
    }

    const existing = await this.introductionRepository.findByUserId(userId)
    if (existing) {
      return Result.fail(new ValidationError("이미 자기소개가 존재합니다."))
    }

    const introduction = Introduction.create({
      userId,
      name: dto.name,
      graduationClass: dto.graduationClass,
      status: dto.status,
      field: dto.field,
      organization: dto.organization,
      location: dto.location,
      selfIntroduction: dto.selfIntroduction,
      lookingFor: dto.lookingFor,
      interests: dto.interests,
      expertise: dto.expertise,
      projects: dto.projects,
      contactPreference: dto.contactPreference,
      contactInfo: dto.contactInfo,
    })

    await this.introductionRepository.save(introduction)

    return Result.ok(introduction.toPrimitives())
  }
}

export class GetIntroductionsUseCase {
  constructor(private readonly repository: IIntroductionRepository) {}

  async execute() {
    const introductions = await this.repository.findAll()
    return introductions.map((i) => i.toPrimitives())
  }
}

export class GetIntroductionByIdUseCase {
  constructor(private readonly repository: IIntroductionRepository) {}

  async execute(
    id: string
  ): Promise<Result<ReturnType<Introduction["toPrimitives"]>, DomainError>> {
    const introduction = await this.repository.findById(id)
    if (!introduction) {
      return Result.fail(new NotFoundError("자기소개"))
    }
    return Result.ok(introduction.toPrimitives())
  }
}

export class UpdateIntroductionUseCase {
  constructor(private readonly repository: IIntroductionRepository) {}

  async execute(
    id: string,
    userId: string,
    updates: Partial<Omit<CreateIntroductionDto, "userId">>
  ): Promise<Result<ReturnType<Introduction["toPrimitives"]>, DomainError>> {
    const introduction = await this.repository.findById(id)
    if (!introduction) {
      return Result.fail(new NotFoundError("자기소개"))
    }

    if (!introduction.isOwnedBy(UserId.create(userId))) {
      return Result.fail(
        new ForbiddenError("본인의 자기소개만 수정할 수 있습니다.")
      )
    }

    introduction.update(updates)
    await this.repository.save(introduction)

    return Result.ok(introduction.toPrimitives())
  }
}

export class DeleteIntroductionUseCase {
  constructor(private readonly repository: IIntroductionRepository) {}

  async execute(
    id: string,
    userId: string
  ): Promise<Result<void, DomainError>> {
    const introduction = await this.repository.findById(id)
    if (!introduction) {
      return Result.fail(new NotFoundError("자기소개"))
    }

    if (!introduction.isOwnedBy(UserId.create(userId))) {
      return Result.fail(
        new ForbiddenError("본인의 자기소개만 삭제할 수 있습니다.")
      )
    }

    await this.repository.delete(id)
    return Result.ok(undefined)
  }
}
