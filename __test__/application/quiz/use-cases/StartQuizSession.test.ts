import { describe, it, expect, vi, beforeEach } from "vitest"
import { StartQuizSessionUseCase } from "@/application/quiz/use-cases/StartQuizSession"
import { QuizSession, QuizConfig } from "@/domain/quiz/entities/QuizSession"
import { QuizQuestion } from "@/domain/quiz/entities/QuizQuestion"
import {
  QuestionType,
  Difficulty,
  QuizSessionId,
} from "@/domain/quiz/value-objects"

const config: QuizConfig = {
  questionsPerSession: 5,
  passingScore: 4,
  maxAttempts: 3,
  sessionDurationMinutes: 30,
}

function makeQuestionRepo() {
  return {
    findById: vi.fn(),
    findByIdString: vi.fn(),
    findAll: vi.fn(),
    findByType: vi.fn(),
    findByDifficulty: vi.fn(),
    findRandom: vi.fn(),
    save: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
  }
}

function makeSessionRepo() {
  return {
    findById: vi.fn(),
    findByIdString: vi.fn(),
    findByEmail: vi.fn(),
    save: vi.fn(),
    delete: vi.fn(),
  }
}

function makeQuestion(): QuizQuestion {
  return QuizQuestion.create({
    type: QuestionType.basic(),
    question: "Test question?",
    options: ["A", "B", "C", "D"],
    correctIndex: 0,
    difficulty: Difficulty.easy(),
  })
}

function makeSession(): QuizSession {
  return QuizSession.create(
    "test@example.com",
    true,
    Array.from({ length: 5 }, makeQuestion),
    config
  )
}

describe("StartQuizSessionUseCase", () => {
  let questionRepo: ReturnType<typeof makeQuestionRepo>
  let sessionRepo: ReturnType<typeof makeSessionRepo>
  let useCase: StartQuizSessionUseCase

  beforeEach(() => {
    questionRepo = makeQuestionRepo()
    sessionRepo = makeSessionRepo()
    useCase = new StartQuizSessionUseCase(questionRepo, sessionRepo, config)
    vi.clearAllMocks()
  })

  const validDto = {
    email: "test@example.com",
    alumniMatched: true,
  }

  it("returns ValidationError when email is missing", async () => {
    const result = await useCase.execute({ email: "", alumniMatched: false })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.name).toBe("ValidationError")
      expect(result.error.message).toContain("이메일")
    }
  })

  it("creates a new session when no existing session found", async () => {
    sessionRepo.findByEmail.mockResolvedValue(null)
    const questions = Array.from({ length: 5 }, makeQuestion)
    questionRepo.findRandom.mockResolvedValue(questions)
    sessionRepo.save.mockResolvedValue(undefined)

    const result = await useCase.execute(validDto)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.value.questions).toHaveLength(5)
      expect(result.value.maxAttempts).toBe(3)
      expect(result.value.passingScore).toBe(4)
    }
    expect(questionRepo.findRandom).toHaveBeenCalledWith(5)
    expect(sessionRepo.save).toHaveBeenCalledOnce()
  })

  it("creates a new session when existing session is expired", async () => {
    const expiredSession = QuizSession.reconstitute({
      sessionId: QuizSessionId.create("expired-session-id"),
      email: "test@example.com",
      alumniMatched: true,
      questions: [],
      attemptCount: 0,
      maxAttempts: 3,
      expiresAt: new Date(Date.now() - 60_000),
      createdAt: new Date(Date.now() - 120_000),
    })
    sessionRepo.findByEmail.mockResolvedValue(expiredSession)
    const questions = Array.from({ length: 5 }, makeQuestion)
    questionRepo.findRandom.mockResolvedValue(questions)
    sessionRepo.save.mockResolvedValue(undefined)

    const result = await useCase.execute(validDto)
    expect(result.success).toBe(true)
    expect(sessionRepo.save).toHaveBeenCalledOnce()
  })

  it("reuses and refreshes existing valid session with attempts remaining", async () => {
    const existingSession = makeSession()
    sessionRepo.findByEmail.mockResolvedValue(existingSession)
    const newQuestions = Array.from({ length: 5 }, makeQuestion)
    questionRepo.findRandom.mockResolvedValue(newQuestions)
    sessionRepo.save.mockResolvedValue(undefined)

    const result = await useCase.execute(validDto)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.value.questions).toHaveLength(5)
    }
    expect(questionRepo.findRandom).toHaveBeenCalledWith(5)
    expect(sessionRepo.save).toHaveBeenCalledOnce()
  })

  it("creates session with alumniId when provided", async () => {
    sessionRepo.findByEmail.mockResolvedValue(null)
    const questions = Array.from({ length: 5 }, makeQuestion)
    questionRepo.findRandom.mockResolvedValue(questions)
    sessionRepo.save.mockResolvedValue(undefined)

    const result = await useCase.execute({
      ...validDto,
      alumniId: "alumni-123",
    })
    expect(result.success).toBe(true)
    expect(sessionRepo.save).toHaveBeenCalledOnce()
  })
})
