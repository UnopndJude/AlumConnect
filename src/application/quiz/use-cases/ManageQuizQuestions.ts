import { QuizQuestion } from "@/domain/quiz/entities/QuizQuestion"
import { IQuizQuestionRepository } from "@/domain/quiz/repositories/IQuizQuestionRepository"
import {
  QuizQuestionId,
  QuestionType,
  Difficulty,
  QuestionTypeValue,
  DifficultyValue,
} from "@/domain/quiz/value-objects"
import { Result } from "@/shared/types/Result"
import {
  ValidationError,
  NotFoundError,
  DomainError,
} from "@/shared/errors/DomainError"

export interface CreateQuestionDto {
  type: QuestionTypeValue
  question: string
  options: string[]
  correctIndex: number
  difficulty: DifficultyValue
  applicableClasses?: { from: number; to: number }
}

export interface UpdateQuestionDto {
  type?: QuestionTypeValue
  question?: string
  options?: string[]
  correctIndex?: number
  difficulty?: DifficultyValue
  applicableClasses?: { from: number; to: number }
}

export class GetAllQuestionsUseCase {
  constructor(private readonly repository: IQuizQuestionRepository) {}

  async execute() {
    const questions = await this.repository.findAll()
    return {
      questions: questions.map((q) => q.toPrimitives()),
      total: questions.length,
    }
  }
}

export class CreateQuestionUseCase {
  constructor(private readonly repository: IQuizQuestionRepository) {}

  async execute(
    dto: CreateQuestionDto
  ): Promise<Result<ReturnType<QuizQuestion["toPrimitives"]>, DomainError>> {
    if (
      !dto.type ||
      !dto.question ||
      !dto.options ||
      dto.correctIndex === undefined ||
      !dto.difficulty
    ) {
      return Result.fail(new ValidationError("모든 필드를 입력해주세요."))
    }

    if (!Array.isArray(dto.options) || dto.options.length !== 4) {
      return Result.fail(new ValidationError("보기는 4개여야 합니다."))
    }

    if (dto.correctIndex < 0 || dto.correctIndex > 3) {
      return Result.fail(
        new ValidationError("정답 인덱스는 0-3 사이여야 합니다.")
      )
    }

    const question = QuizQuestion.create({
      type: QuestionType.fromString(dto.type),
      question: dto.question,
      options: dto.options,
      correctIndex: dto.correctIndex,
      difficulty: Difficulty.fromString(dto.difficulty),
      applicableClasses: dto.applicableClasses,
    })

    await this.repository.save(question)

    return Result.ok(question.toPrimitives())
  }
}

export class UpdateQuestionUseCase {
  constructor(private readonly repository: IQuizQuestionRepository) {}

  async execute(
    id: string,
    dto: UpdateQuestionDto
  ): Promise<Result<ReturnType<QuizQuestion["toPrimitives"]>, DomainError>> {
    const question = await this.repository.findByIdString(id)
    if (!question) {
      return Result.fail(new NotFoundError("문제"))
    }

    if (
      dto.options &&
      (!Array.isArray(dto.options) || dto.options.length !== 4)
    ) {
      return Result.fail(new ValidationError("보기는 4개여야 합니다."))
    }

    if (
      dto.correctIndex !== undefined &&
      (dto.correctIndex < 0 || dto.correctIndex > 3)
    ) {
      return Result.fail(
        new ValidationError("정답 인덱스는 0-3 사이여야 합니다.")
      )
    }

    question.update({
      type: dto.type ? QuestionType.fromString(dto.type) : undefined,
      question: dto.question,
      options: dto.options,
      correctIndex: dto.correctIndex,
      difficulty: dto.difficulty
        ? Difficulty.fromString(dto.difficulty)
        : undefined,
      applicableClasses: dto.applicableClasses,
    })

    await this.repository.save(question)

    return Result.ok(question.toPrimitives())
  }
}

export class DeleteQuestionUseCase {
  constructor(private readonly repository: IQuizQuestionRepository) {}

  async execute(id: string): Promise<Result<void, DomainError>> {
    const deleted = await this.repository.delete(QuizQuestionId.create(id))
    if (!deleted) {
      return Result.fail(new NotFoundError("문제"))
    }
    return Result.ok(undefined)
  }
}
