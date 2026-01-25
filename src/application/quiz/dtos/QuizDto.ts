import { QuizQuestion } from "@/domain/quiz/entities/QuizQuestion"
import { QuizSession } from "@/domain/quiz/entities/QuizSession"
import { QuestionTypeValue, DifficultyValue } from "@/domain/quiz/value-objects"

export interface QuizQuestionPublicDto {
  id: string
  type: QuestionTypeValue
  question: string
  options: string[]
  difficulty: DifficultyValue
}

export interface QuizSessionDto {
  sessionId: string
  questions: QuizQuestionPublicDto[]
  attemptCount: number
  maxAttempts: number
  passingScore: number
  expiresAt: string
}

export interface StartQuizDto {
  email: string
  alumniMatched: boolean
  alumniId?: string
}

export interface SubmitQuizDto {
  sessionId: string
  answers: number[]
}

export interface QuizSubmitResultDto {
  success: boolean
  score: number
  totalQuestions: number
  passed: boolean
  attemptsRemaining: number
  message: string
  newQuestions?: QuizQuestionPublicDto[]
}

export function toQuizQuestionPublicDto(
  question: QuizQuestion
): QuizQuestionPublicDto {
  return question.toPublicPrimitives()
}

export function toQuizSessionDto(
  session: QuizSession,
  passingScore: number
): QuizSessionDto {
  return {
    sessionId: session.sessionId.getValue(),
    questions: session.questions.map(toQuizQuestionPublicDto),
    attemptCount: session.attemptCount,
    maxAttempts: session.maxAttempts,
    passingScore,
    expiresAt: session.expiresAt.toISOString(),
  }
}
