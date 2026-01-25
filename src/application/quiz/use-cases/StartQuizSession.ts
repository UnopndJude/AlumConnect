import { QuizSession, QuizConfig } from "@/domain/quiz/entities/QuizSession"
import { IQuizQuestionRepository } from "@/domain/quiz/repositories/IQuizQuestionRepository"
import { IQuizSessionRepository } from "@/domain/quiz/repositories/IQuizSessionRepository"
import { AlumniId } from "@/domain/alumni/value-objects"
import { Result } from "@/shared/types/Result"
import { ValidationError, DomainError } from "@/shared/errors/DomainError"
import { StartQuizDto, QuizSessionDto, toQuizSessionDto } from "../dtos/QuizDto"

export class StartQuizSessionUseCase {
  constructor(
    private readonly quizQuestionRepository: IQuizQuestionRepository,
    private readonly quizSessionRepository: IQuizSessionRepository,
    private readonly config: QuizConfig
  ) {}

  async execute(
    dto: StartQuizDto
  ): Promise<Result<QuizSessionDto, DomainError>> {
    if (!dto.email) {
      return Result.fail(new ValidationError("이메일이 필요합니다."))
    }

    // Check for existing session
    const existingSession = await this.quizSessionRepository.findByEmail(
      dto.email
    )
    if (
      existingSession &&
      !existingSession.isExpired() &&
      existingSession.hasAttemptsRemaining()
    ) {
      // Refresh questions for retry
      const questions = await this.quizQuestionRepository.findRandom(
        this.config.questionsPerSession
      )
      existingSession.updateQuestions(questions)
      await this.quizSessionRepository.save(existingSession)
      return Result.ok(
        toQuizSessionDto(existingSession, this.config.passingScore)
      )
    }

    // Create new session
    const questions = await this.quizQuestionRepository.findRandom(
      this.config.questionsPerSession
    )

    const alumniId = dto.alumniId ? AlumniId.create(dto.alumniId) : undefined

    const session = QuizSession.create(
      dto.email,
      dto.alumniMatched,
      questions,
      this.config,
      alumniId
    )

    await this.quizSessionRepository.save(session)

    return Result.ok(toQuizSessionDto(session, this.config.passingScore))
  }
}
