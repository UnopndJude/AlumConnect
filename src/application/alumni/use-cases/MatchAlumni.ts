import { AlumniMatchingService } from "@/domain/alumni/services/AlumniMatchingService"
import { GraduationClass } from "@/domain/user/value-objects"
import { Result } from "@/shared/types/Result"
import { ValidationError, DomainError } from "@/shared/errors/DomainError"
import { MatchConfidenceType } from "@/domain/alumni/value-objects"

export interface MatchAlumniDto {
  name: string
  graduationClass: number
  email: string
}

export interface MatchAlumniResultDto {
  matched: boolean
  alumniId?: string
  confidence: MatchConfidenceType
  message: string
}

export class MatchAlumniUseCase {
  constructor(private readonly matchingService: AlumniMatchingService) {}

  async execute(
    dto: MatchAlumniDto
  ): Promise<Result<MatchAlumniResultDto, DomainError>> {
    if (!dto.name || !dto.graduationClass || !dto.email) {
      return Result.fail(new ValidationError("모든 필드를 입력해주세요."))
    }

    const graduationClassResult = GraduationClass.create(dto.graduationClass)
    if (!graduationClassResult.success) {
      return Result.fail(graduationClassResult.error)
    }

    const result = await this.matchingService.match(
      dto.name,
      graduationClassResult.value
    )

    return Result.ok(result.toPrimitives())
  }
}
