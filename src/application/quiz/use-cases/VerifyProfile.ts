import { QuizGradingService } from "@/domain/quiz/services/QuizGradingService"
import { IQuizQuestionRepository } from "@/domain/quiz/repositories/IQuizQuestionRepository"
import { IQuizSessionRepository } from "@/domain/quiz/repositories/IQuizSessionRepository"
import { IProfileRepository } from "@/domain/profile/repositories/IProfileRepository"
import { QuizConfig } from "@/domain/quiz/entities/QuizSession"
import { Result } from "@/shared/types/Result"
import {
  ValidationError,
  DomainError,
  NotFoundError,
} from "@/shared/errors/DomainError"
import { ProfileId } from "@/domain/profile/value-objects"
import {
  SubmitQuizDto,
  QuizSubmitResultDto,
  toQuizQuestionPublicDto,
} from "../dtos/QuizDto"

export interface VerifyProfileDto extends SubmitQuizDto {
  profileId: string
}

export interface VerifyProfileResultDto extends QuizSubmitResultDto {
  verified: boolean
}

export class VerifyProfileUseCase {
  constructor(
    private readonly quizSessionRepository: IQuizSessionRepository,
    private readonly quizQuestionRepository: IQuizQuestionRepository,
    private readonly profileRepository: IProfileRepository,
    private readonly gradingService: QuizGradingService,
    private readonly config: QuizConfig
  ) {}

  async execute(
    dto: VerifyProfileDto
  ): Promise<Result<VerifyProfileResultDto, DomainError>> {
    if (!dto.sessionId || !dto.answers || !Array.isArray(dto.answers)) {
      return Result.fail(new ValidationError("잘못된 요청입니다."))
    }

    if (!dto.profileId) {
      return Result.fail(new ValidationError("프로필 ID가 필요합니다."))
    }

    const session = await this.quizSessionRepository.findByIdString(
      dto.sessionId
    )
    if (!session) {
      return Result.fail(new NotFoundError("퀴즈 세션"))
    }

    const result = this.gradingService.grade(session, dto.answers)

    // If passed, verify the profile
    let verified = false
    if (result.passed) {
      const profile = await this.profileRepository.findById(
        ProfileId.create(dto.profileId)
      )
      if (!profile) {
        return Result.fail(new NotFoundError("프로필"))
      }
      profile.verify()
      await this.profileRepository.save(profile)
      verified = true
    }

    // If failed but has retries, get new questions
    let newQuestions = undefined
    if (!result.passed && result.attemptsRemaining > 0) {
      const questions = await this.quizQuestionRepository.findRandom(
        this.config.questionsPerSession
      )
      session.updateQuestions(questions)
      newQuestions = questions.map(toQuizQuestionPublicDto)
    }

    await this.quizSessionRepository.save(session)

    return Result.ok({
      success: result.success,
      score: result.score.getCorrect(),
      totalQuestions: result.score.getTotal(),
      passed: result.passed,
      attemptsRemaining: result.attemptsRemaining,
      message: result.message,
      newQuestions,
      verified,
    })
  }
}
