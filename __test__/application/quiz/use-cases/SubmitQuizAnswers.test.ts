import { describe, it, expect, vi, beforeEach } from "vitest"
import { SubmitQuizAnswersUseCase } from "@/application/quiz/use-cases/SubmitQuizAnswers"
import { QuizSession, QuizConfig } from "@/domain/quiz/entities/QuizSession"
import { QuizQuestion } from "@/domain/quiz/entities/QuizQuestion"
import { QuizGradingService } from "@/domain/quiz/services/QuizGradingService"
import {
  QuizScore,
  QuestionType,
  Difficulty,
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
    question: "Q?",
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

describe("SubmitQuizAnswersUseCase", () => {
  let sessionRepo: ReturnType<typeof makeSessionRepo>
  let questionRepo: ReturnType<typeof makeQuestionRepo>
  let gradingService: QuizGradingService
  let useCase: SubmitQuizAnswersUseCase

  beforeEach(() => {
    sessionRepo = makeSessionRepo()
    questionRepo = makeQuestionRepo()
    gradingService = new QuizGradingService(config)
    useCase = new SubmitQuizAnswersUseCase(
      sessionRepo,
      questionRepo,
      gradingService,
      config
    )
    vi.clearAllMocks()
  })

  const validDto = { sessionId: "session-1", answers: [0, 1, 2, 0, 1] }

  it("returns ValidationError when sessionId is missing", async () => {
    const result = await useCase.execute({ sessionId: "", answers: [0] })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.name).toBe("ValidationError")
      expect(result.error.message).toContain("잘못된 요청")
    }
  })

  it("returns ValidationError when answers is not provided", async () => {
    const result = await useCase.execute({
      sessionId: "s1",
      answers: undefined as unknown as number[],
    })
    expect(result.success).toBe(false)
    if (!result.success) expect(result.error.name).toBe("ValidationError")
  })

  it("returns NotFoundError when session does not exist", async () => {
    sessionRepo.findByIdString.mockResolvedValue(null)
    const result = await useCase.execute(validDto)
    expect(result.success).toBe(false)
    if (!result.success) expect(result.error.name).toBe("NotFoundError")
  })

  it("returns passed result with no new questions when quiz is passed", async () => {
    const session = makeSession()
    sessionRepo.findByIdString.mockResolvedValue(session)
    vi.spyOn(gradingService, "grade").mockReturnValue({
      success: true,
      score: QuizScore.create(4, 5, 4),
      passed: true,
      attemptsRemaining: 2,
      message: "축하합니다!",
    })

    const result = await useCase.execute(validDto)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.value.passed).toBe(true)
      expect(result.value.score).toBe(4)
      expect(result.value.totalQuestions).toBe(5)
      expect(result.value.newQuestions).toBeUndefined()
    }
    expect(sessionRepo.save).toHaveBeenCalledOnce()
    expect(questionRepo.findRandom).not.toHaveBeenCalled()
  })

  it("returns failed result with new questions when retries remain", async () => {
    const session = makeSession()
    sessionRepo.findByIdString.mockResolvedValue(session)
    const freshQuestions = Array.from({ length: 5 }, makeQuestion)
    questionRepo.findRandom.mockResolvedValue(freshQuestions)
    vi.spyOn(gradingService, "grade").mockReturnValue({
      success: true,
      score: QuizScore.create(2, 5, 4),
      passed: false,
      attemptsRemaining: 1,
      message: "아쉽네요. 1번의 기회가 남았습니다.",
    })

    const result = await useCase.execute(validDto)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.value.passed).toBe(false)
      expect(result.value.attemptsRemaining).toBe(1)
      expect(result.value.newQuestions).toHaveLength(5)
    }
    expect(questionRepo.findRandom).toHaveBeenCalledWith(
      config.questionsPerSession
    )
    expect(sessionRepo.save).toHaveBeenCalledOnce()
  })

  it("returns failed result with no new questions when retries are exhausted", async () => {
    const session = makeSession()
    sessionRepo.findByIdString.mockResolvedValue(session)
    vi.spyOn(gradingService, "grade").mockReturnValue({
      success: true,
      score: QuizScore.create(1, 5, 4),
      passed: false,
      attemptsRemaining: 0,
      message: "더 이상 시도할 수 없습니다.",
    })

    const result = await useCase.execute(validDto)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.value.passed).toBe(false)
      expect(result.value.attemptsRemaining).toBe(0)
      expect(result.value.newQuestions).toBeUndefined()
    }
    expect(questionRepo.findRandom).not.toHaveBeenCalled()
  })
})
