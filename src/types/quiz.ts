// Re-export types for backward compatibility
export type { QuestionTypeValue as QuizQuestionType } from "@/domain/quiz/value-objects/QuestionType"
export type { DifficultyValue as QuizDifficulty } from "@/domain/quiz/value-objects/Difficulty"

export interface QuizQuestion {
  id: string
  type: "basic" | "facility" | "culture" | "class_specific"
  question: string
  options: string[]
  correctIndex: number
  applicableClasses?: { from: number; to: number }
  difficulty: "easy" | "medium" | "hard"
}

export interface QuizQuestionPublic {
  id: string
  type: QuizQuestion["type"]
  question: string
  options: string[]
  difficulty: QuizQuestion["difficulty"]
}

export interface QuizAttempt {
  attemptId: string
  email: string
  sessionId: string
  answers: number[]
  score: number
  passed: boolean
  attemptedAt: Date
}

export interface QuizSession {
  sessionId: string
  email: string
  alumniId?: string
  alumniMatched: boolean
  questions: QuizQuestion[]
  attemptCount: number
  maxAttempts: number
  expiresAt: Date
  createdAt: Date
}

export interface QuizSubmitResult {
  success: boolean
  score: number
  totalQuestions: number
  passed: boolean
  attemptsRemaining: number
  message: string
}
