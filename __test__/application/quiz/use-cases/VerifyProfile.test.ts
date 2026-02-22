import { describe, it, expect, vi, beforeEach } from "vitest"
import { VerifyProfileUseCase } from "@/application/quiz/use-cases/VerifyProfile"
import { QuizSession, QuizConfig } from "@/domain/quiz/entities/QuizSession"
import { QuizQuestion } from "@/domain/quiz/entities/QuizQuestion"
import { QuizGradingService } from "@/domain/quiz/services/QuizGradingService"
import {
  QuizScore,
  QuestionType,
  Difficulty,
} from "@/domain/quiz/value-objects"
import { Profile } from "@/domain/profile/entities/Profile"
import { Email, GraduationClass } from "@/domain/user/value-objects"

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

function makeProfileRepo() {
  return {
    findById: vi.fn(),
    findByEmail: vi.fn(),
    findByAlumniId: vi.fn(),
    findAll: vi.fn(),
    save: vi.fn(),
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

function makeProfile(): Profile {
  const email = Email.create("alumni@example.com")
  const grad = GraduationClass.create(5)
  if (!email.success || !grad.success) throw new Error("factory failed")
  return Profile.create({
    email: email.value,
    name: "Alumni User",
    graduationClass: grad.value,
  })
}

describe("VerifyProfileUseCase", () => {
  let sessionRepo: ReturnType<typeof makeSessionRepo>
  let questionRepo: ReturnType<typeof makeQuestionRepo>
  let profileRepo: ReturnType<typeof makeProfileRepo>
  let gradingService: QuizGradingService
  let useCase: VerifyProfileUseCase

  beforeEach(() => {
    sessionRepo = makeSessionRepo()
    questionRepo = makeQuestionRepo()
    profileRepo = makeProfileRepo()
    gradingService = new QuizGradingService(config)
    useCase = new VerifyProfileUseCase(
      sessionRepo,
      questionRepo,
      profileRepo,
      gradingService,
      config
    )
    vi.clearAllMocks()
  })

  const validDto = {
    sessionId: "session-1",
    answers: [0, 0, 0, 0, 0],
    profileId: "profile-1",
  }

  it("returns ValidationError when sessionId is missing", async () => {
    const result = await useCase.execute({
      ...validDto,
      sessionId: "",
    })
    expect(result.success).toBe(false)
    if (!result.success) expect(result.error.name).toBe("ValidationError")
  })

  it("returns ValidationError when answers is not provided", async () => {
    const result = await useCase.execute({
      ...validDto,
      answers: undefined as unknown as number[],
    })
    expect(result.success).toBe(false)
    if (!result.success) expect(result.error.name).toBe("ValidationError")
  })

  it("returns ValidationError when profileId is missing", async () => {
    const result = await useCase.execute({
      ...validDto,
      profileId: "",
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.name).toBe("ValidationError")
      expect(result.error.message).toContain("프로필 ID")
    }
  })

  it("returns NotFoundError when session does not exist", async () => {
    sessionRepo.findByIdString.mockResolvedValue(null)
    const result = await useCase.execute(validDto)
    expect(result.success).toBe(false)
    if (!result.success) expect(result.error.name).toBe("NotFoundError")
  })

  it("returns NotFoundError when quiz passed but profile does not exist", async () => {
    sessionRepo.findByIdString.mockResolvedValue(makeSession())
    profileRepo.findById.mockResolvedValue(null)
    vi.spyOn(gradingService, "grade").mockReturnValue({
      success: true,
      score: QuizScore.create(4, 5, 4),
      passed: true,
      attemptsRemaining: 2,
      message: "축하합니다!",
    })

    const result = await useCase.execute(validDto)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.name).toBe("NotFoundError")
      expect(result.error.message).toContain("프로필")
    }
  })

  it("verifies profile and returns verified=true when quiz is passed", async () => {
    const session = makeSession()
    const profile = makeProfile()
    sessionRepo.findByIdString.mockResolvedValue(session)
    profileRepo.findById.mockResolvedValue(profile)
    profileRepo.save.mockResolvedValue(undefined)
    sessionRepo.save.mockResolvedValue(undefined)
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
      expect(result.value.verified).toBe(true)
      expect(result.value.score).toBe(4)
      expect(result.value.newQuestions).toBeUndefined()
    }
    expect(profileRepo.save).toHaveBeenCalledOnce()
    expect(sessionRepo.save).toHaveBeenCalledOnce()
  })

  it("returns verified=false and new questions when quiz fails with retries remaining", async () => {
    const session = makeSession()
    sessionRepo.findByIdString.mockResolvedValue(session)
    sessionRepo.save.mockResolvedValue(undefined)
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
      expect(result.value.verified).toBe(false)
      expect(result.value.newQuestions).toHaveLength(5)
    }
    expect(profileRepo.save).not.toHaveBeenCalled()
    expect(questionRepo.findRandom).toHaveBeenCalledWith(
      config.questionsPerSession
    )
  })

  it("returns verified=false and no new questions when retries are exhausted", async () => {
    const session = makeSession()
    sessionRepo.findByIdString.mockResolvedValue(session)
    sessionRepo.save.mockResolvedValue(undefined)
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
      expect(result.value.verified).toBe(false)
      expect(result.value.newQuestions).toBeUndefined()
    }
    expect(questionRepo.findRandom).not.toHaveBeenCalled()
    expect(profileRepo.save).not.toHaveBeenCalled()
  })
})
