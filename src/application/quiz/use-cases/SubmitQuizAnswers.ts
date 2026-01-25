import { QuizGradingService } from "@/domain/quiz/services/QuizGradingService"
import { IQuizQuestionRepository } from "@/domain/quiz/repositories/IQuizQuestionRepository"
import { IQuizSessionRepository } from "@/domain/quiz/repositories/IQuizSessionRepository"
import { QuizConfig } from "@/domain/quiz/entities/QuizSession"
import { Result } from "@/shared/types/Result"
import {
  ValidationError,
  DomainError,
  NotFoundError,
} from "@/shared/errors/DomainError"
import {
  SubmitQuizDto,
  QuizSubmitResultDto,
  toQuizQuestionPublicDto,
} from "../dtos/QuizDto"

export class SubmitQuizAnswersUseCase {
  constructor(
    private readonly quizSessionRepository: IQuizSessionRepository,
    private readonly quizQuestionRepository: IQuizQuestionRepository,
    private readonly gradingService: QuizGradingService,
    private readonly config: QuizConfig
  ) {}

  async execute(
    dto: SubmitQuizDto
  ): Promise<Result<QuizSubmitResultDto, DomainError>> {
    if (!dto.sessionId || !dto.answers || !Array.isArray(dto.answers)) {
      return Result.fail(new ValidationError("잘못된 요청입니다."))
    }

    const session = await this.quizSessionRepository.findByIdString(
      dto.sessionId
    )
    if (!session) {
      return Result.fail(new NotFoundError("퀴즈 세션"))
    }

    const result = this.gradingService.grade(session, dto.answers)

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
    })
  }
}
