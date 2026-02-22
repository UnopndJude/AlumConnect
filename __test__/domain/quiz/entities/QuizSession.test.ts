import { describe, it, expect } from "vitest"
import { QuizSession, QuizConfig } from "@/domain/quiz/entities/QuizSession"
import { QuizQuestion } from "@/domain/quiz/entities/QuizQuestion"
import {
  QuestionType,
  Difficulty,
  QuizSessionId,
} from "@/domain/quiz/value-objects"

const config: QuizConfig = {
  questionsPerSession: 3,
  maxAttempts: 2,
  passingScore: 2,
  sessionDurationMinutes: 30,
}

function makeQuestion(correctIndex = 0) {
  return QuizQuestion.create({
    type: QuestionType.basic(),
    question: "Q?",
    options: ["A", "B", "C", "D"],
    correctIndex,
    difficulty: Difficulty.fromString("easy"),
  })
}

function makeSession() {
  return QuizSession.create(
    "test@test.com",
    true,
    [makeQuestion(0), makeQuestion(1), makeQuestion(2)],
    config
  )
}

describe("QuizSession", () => {
  it("should create with correct defaults", () => {
    const session = makeSession()
    expect(session.email).toBe("test@test.com")
    expect(session.alumniMatched).toBe(true)
    expect(session.attemptCount).toBe(0)
    expect(session.maxAttempts).toBe(2)
    expect(session.questions).toHaveLength(3)
    expect(session.sessionId).toBeDefined()
  })

  it("should not be expired when just created", () => {
    const session = makeSession()
    expect(session.isExpired()).toBe(false)
  })

  it("should have attempts remaining when created", () => {
    const session = makeSession()
    expect(session.hasAttemptsRemaining()).toBe(true)
    expect(session.getAttemptsRemaining()).toBe(2)
  })

  it("should increment attempt count", () => {
    const session = makeSession()
    session.incrementAttempt()
    expect(session.attemptCount).toBe(1)
    expect(session.getAttemptsRemaining()).toBe(1)
  })

  it("should have no attempts remaining after max", () => {
    const session = makeSession()
    session.incrementAttempt()
    session.incrementAttempt()
    expect(session.hasAttemptsRemaining()).toBe(false)
    expect(session.getAttemptsRemaining()).toBe(0)
  })

  it("should update questions", () => {
    const session = makeSession()
    const newQs = [makeQuestion(3)]
    session.updateQuestions(newQs)
    expect(session.questions).toHaveLength(1)
  })

  it("should grade answers correctly", () => {
    const session = makeSession()
    const score = session.grade([0, 1, 2], 2)
    expect(score.getCorrect()).toBe(3)
    expect(score.getTotal()).toBe(3)
    expect(score.passed()).toBe(true)
  })

  it("should grade wrong answers", () => {
    const session = makeSession()
    const score = session.grade([3, 3, 3], 2)
    expect(score.getCorrect()).toBe(0)
    expect(score.passed()).toBe(false)
  })

  it("should check canAutoApprove", () => {
    const session = makeSession()
    expect(session.canAutoApprove(true)).toBe(true)
    expect(session.canAutoApprove(false)).toBe(false)

    const noMatch = QuizSession.create(
      "x@x.com",
      false,
      [makeQuestion()],
      config
    )
    expect(noMatch.canAutoApprove(true)).toBe(false)
  })

  it("should be expired when expiresAt is in the past", () => {
    const session = QuizSession.reconstitute({
      sessionId: QuizSessionId.create(),
      email: "t@t.com",
      alumniMatched: false,
      questions: [makeQuestion()],
      attemptCount: 0,
      maxAttempts: 2,
      expiresAt: new Date(Date.now() - 1000),
      createdAt: new Date(),
    })
    expect(session.isExpired()).toBe(true)
  })

  it("should return defensive copy of questions", () => {
    const session = makeSession()
    const q1 = session.questions
    const q2 = session.questions
    expect(q1).not.toBe(q2)
    expect(q1).toHaveLength(q2.length)
  })
})
