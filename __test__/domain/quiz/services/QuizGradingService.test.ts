import { describe, it, expect } from "vitest"
import { QuizGradingService } from "@/domain/quiz/services/QuizGradingService"
import { QuizSession, QuizConfig } from "@/domain/quiz/entities/QuizSession"
import { QuizQuestion } from "@/domain/quiz/entities/QuizQuestion"
import { QuestionType, Difficulty } from "@/domain/quiz/value-objects"

const config: QuizConfig = {
  questionsPerSession: 5,
  maxAttempts: 3,
  passingScore: 3,
  sessionDurationMinutes: 30,
}

function makeQuestion(correctIndex = 0) {
  return QuizQuestion.create({
    type: QuestionType.fromString("basic"),
    question: "Test question?",
    options: ["A", "B", "C", "D"],
    correctIndex,
    difficulty: Difficulty.fromString("easy"),
  })
}

function makeSession(questions?: QuizQuestion[]) {
  const qs = questions ?? Array.from({ length: 5 }, () => makeQuestion())
  return QuizSession.create("test@test.com", false, qs, config)
}

describe("QuizGradingService", () => {
  const service = new QuizGradingService(config)

  it("should pass when enough correct answers", () => {
    const session = makeSession()
    const result = service.grade(session, [0, 0, 0, 0, 0])
    expect(result.passed).toBe(true)
    expect(result.success).toBe(true)
    expect(result.score.getCorrect()).toBe(5)
    expect(result.score.getTotal()).toBe(5)
  })

  it("should fail when not enough correct answers", () => {
    const session = makeSession()
    const result = service.grade(session, [0, 0, 1, 1, 1])
    expect(result.passed).toBe(false)
    expect(result.score.getCorrect()).toBe(2)
    expect(result.attemptsRemaining).toBe(2)
  })

  it("should return expired message for expired session", () => {
    const session = makeSession()
    // Force expire by manipulating the session
    const expiredSession = QuizSession.reconstitute({
      sessionId: session.sessionId,
      email: "test@test.com",
      alumniMatched: false,
      questions: session.questions,
      attemptCount: 0,
      maxAttempts: 3,
      expiresAt: new Date(Date.now() - 1000),
      createdAt: new Date(),
    })
    const result = service.grade(expiredSession, [0, 0, 0, 0, 0])
    expect(result.passed).toBe(false)
    expect(result.attemptsRemaining).toBe(0)
    expect(result.message).toContain("만료")
  })

  it("should return no attempts message when max attempts reached", () => {
    const session = makeSession()
    // Exhaust all attempts
    service.grade(session, [1, 1, 1, 1, 1])
    service.grade(session, [1, 1, 1, 1, 1])
    service.grade(session, [1, 1, 1, 1, 1])
    const result = service.grade(session, [0, 0, 0, 0, 0])
    expect(result.passed).toBe(false)
    expect(result.attemptsRemaining).toBe(0)
    expect(result.message).toContain("초과")
  })

  it("should decrement attempts on each grade", () => {
    const session = makeSession()
    const r1 = service.grade(session, [1, 1, 1, 1, 1])
    expect(r1.attemptsRemaining).toBe(2)
    const r2 = service.grade(session, [1, 1, 1, 1, 1])
    expect(r2.attemptsRemaining).toBe(1)
  })

  it("should return config", () => {
    const c = service.getConfig()
    expect(c.questionsPerSession).toBe(5)
    expect(c.maxAttempts).toBe(3)
    expect(c.passingScore).toBe(3)
  })
})
