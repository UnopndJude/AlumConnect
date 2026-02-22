import { describe, it, expect } from "vitest"
import { QuizQuestion } from "@/domain/quiz/entities/QuizQuestion"
import {
  QuestionType,
  Difficulty,
  QuizQuestionId,
} from "@/domain/quiz/value-objects"

function makeQuestion(overrides?: Partial<{ correctIndex: number }>) {
  return QuizQuestion.create({
    type: QuestionType.basic(),
    question: "What is 1+1?",
    options: ["1", "2", "3", "4"],
    correctIndex: overrides?.correctIndex ?? 1,
    difficulty: Difficulty.fromString("easy"),
  })
}

describe("QuizQuestion", () => {
  it("should create a question with auto-generated id", () => {
    const q = makeQuestion()
    expect(q.id).toBeDefined()
    expect(q.question).toBe("What is 1+1?")
    expect(q.options).toEqual(["1", "2", "3", "4"])
    expect(q.correctIndex).toBe(1)
    expect(q.type.getValue()).toBe("basic")
    expect(q.difficulty.getValue()).toBe("easy")
  })

  it("should return defensive copy of options", () => {
    const q = makeQuestion()
    const opts1 = q.options
    const opts2 = q.options
    expect(opts1).toEqual(opts2)
    expect(opts1).not.toBe(opts2)
  })

  it("should check correct answer", () => {
    const q = makeQuestion({ correctIndex: 2 })
    expect(q.isCorrect(2)).toBe(true)
    expect(q.isCorrect(0)).toBe(false)
    expect(q.isCorrect(3)).toBe(false)
  })

  it("should update question properties", () => {
    const q = makeQuestion()
    q.update({
      question: "Updated?",
      options: ["A", "B", "C", "D"],
      correctIndex: 0,
      type: QuestionType.culture(),
      difficulty: Difficulty.fromString("hard"),
      applicableClasses: { from: 1, to: 10 },
    })
    expect(q.question).toBe("Updated?")
    expect(q.options).toEqual(["A", "B", "C", "D"])
    expect(q.correctIndex).toBe(0)
    expect(q.type.getValue()).toBe("culture")
    expect(q.applicableClasses).toEqual({ from: 1, to: 10 })
  })

  it("should handle applicableClasses", () => {
    const q = QuizQuestion.create({
      type: QuestionType.classSpecific(),
      question: "Class specific?",
      options: ["A", "B", "C", "D"],
      correctIndex: 0,
      difficulty: Difficulty.fromString("medium"),
      applicableClasses: { from: 5, to: 15 },
    })
    expect(q.applicableClasses).toEqual({ from: 5, to: 15 })
  })

  it("should reconstitute from props", () => {
    const id = QuizQuestionId.create("q-id")
    const q = QuizQuestion.reconstitute({
      id,
      type: QuestionType.facility(),
      question: "Where?",
      options: ["A", "B", "C", "D"],
      correctIndex: 3,
      difficulty: Difficulty.fromString("medium"),
    })
    expect(q.id.getValue()).toBe("q-id")
    expect(q.type.getValue()).toBe("facility")
  })

  it("should serialize to primitives", () => {
    const q = makeQuestion()
    const p = q.toPrimitives()
    expect(p.question).toBe("What is 1+1?")
    expect(p.type).toBe("basic")
    expect(p.difficulty).toBe("easy")
    expect(p.correctIndex).toBe(1)
    expect(p.id).toBeDefined()
  })

  it("should serialize to public primitives (no correctIndex)", () => {
    const q = makeQuestion()
    const p = q.toPublicPrimitives()
    expect(p.question).toBe("What is 1+1?")
    expect(p.type).toBe("basic")
    expect(p).not.toHaveProperty("correctIndex")
  })
})
