import { describe, it, expect, vi, beforeEach } from "vitest"
import {
  GetAllQuestionsUseCase,
  CreateQuestionUseCase,
  UpdateQuestionUseCase,
  DeleteQuestionUseCase,
} from "@/application/quiz/use-cases/ManageQuizQuestions"
import { QuizQuestion } from "@/domain/quiz/entities/QuizQuestion"
import { QuestionType, Difficulty } from "@/domain/quiz/value-objects"

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

function makeQuestion(): QuizQuestion {
  return QuizQuestion.create({
    type: QuestionType.basic(),
    question: "What year was the school founded?",
    options: ["1990", "1991", "1992", "1993"],
    correctIndex: 1,
    difficulty: Difficulty.easy(),
  })
}

const validDto = {
  type: "basic" as const,
  question: "Test question?",
  options: ["A", "B", "C", "D"],
  correctIndex: 0,
  difficulty: "easy" as const,
}

describe("GetAllQuestionsUseCase", () => {
  const questionRepo = makeQuestionRepo()
  const useCase = new GetAllQuestionsUseCase(questionRepo)

  beforeEach(() => vi.clearAllMocks())

  it("returns all questions with total count", async () => {
    questionRepo.findAll.mockResolvedValue([makeQuestion(), makeQuestion()])
    const result = await useCase.execute()
    expect(result.total).toBe(2)
    expect(result.questions).toHaveLength(2)
    expect(result.questions[0].question).toBe(
      "What year was the school founded?"
    )
  })

  it("returns empty list when no questions exist", async () => {
    questionRepo.findAll.mockResolvedValue([])
    const result = await useCase.execute()
    expect(result.total).toBe(0)
    expect(result.questions).toHaveLength(0)
  })
})

describe("CreateQuestionUseCase", () => {
  const questionRepo = makeQuestionRepo()
  const useCase = new CreateQuestionUseCase(questionRepo)

  beforeEach(() => vi.clearAllMocks())

  it("returns ValidationError when required fields are missing", async () => {
    const result = await useCase.execute({
      type: "basic",
      question: "",
      options: ["A", "B", "C", "D"],
      correctIndex: 0,
      difficulty: "easy",
    })
    expect(result.success).toBe(false)
    if (!result.success) expect(result.error.name).toBe("ValidationError")
  })

  it("returns ValidationError when options count is not exactly 4", async () => {
    const result = await useCase.execute({
      ...validDto,
      options: ["A", "B", "C"],
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.name).toBe("ValidationError")
      expect(result.error.message).toContain("4")
    }
  })

  it("returns ValidationError when correctIndex is out of 0-3 range", async () => {
    const result = await useCase.execute({ ...validDto, correctIndex: 4 })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.name).toBe("ValidationError")
      expect(result.error.message).toContain("0-3")
    }
  })

  it("returns ValidationError when correctIndex is negative", async () => {
    const result = await useCase.execute({ ...validDto, correctIndex: -1 })
    expect(result.success).toBe(false)
    if (!result.success) expect(result.error.name).toBe("ValidationError")
  })

  it("creates and returns question primitives on success", async () => {
    questionRepo.save.mockResolvedValue(undefined)
    const result = await useCase.execute(validDto)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.value.question).toBe("Test question?")
      expect(result.value.type).toBe("basic")
      expect(result.value.correctIndex).toBe(0)
    }
    expect(questionRepo.save).toHaveBeenCalledOnce()
  })

  it("creates question with applicableClasses when provided", async () => {
    questionRepo.save.mockResolvedValue(undefined)
    const result = await useCase.execute({
      ...validDto,
      applicableClasses: { from: 1, to: 10 },
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.value.applicableClasses).toEqual({ from: 1, to: 10 })
    }
  })
})

describe("UpdateQuestionUseCase", () => {
  const questionRepo = makeQuestionRepo()
  const useCase = new UpdateQuestionUseCase(questionRepo)

  beforeEach(() => vi.clearAllMocks())

  it("returns NotFoundError when question does not exist", async () => {
    questionRepo.findByIdString.mockResolvedValue(null)
    const result = await useCase.execute("bad-id", { question: "updated?" })
    expect(result.success).toBe(false)
    if (!result.success) expect(result.error.name).toBe("NotFoundError")
  })

  it("returns ValidationError when updating options count is not 4", async () => {
    questionRepo.findByIdString.mockResolvedValue(makeQuestion())
    const result = await useCase.execute("id", { options: ["A", "B"] })
    expect(result.success).toBe(false)
    if (!result.success) expect(result.error.name).toBe("ValidationError")
  })

  it("returns ValidationError when updating correctIndex is out of range", async () => {
    questionRepo.findByIdString.mockResolvedValue(makeQuestion())
    const result = await useCase.execute("id", { correctIndex: 5 })
    expect(result.success).toBe(false)
    if (!result.success) expect(result.error.name).toBe("ValidationError")
  })

  it("updates and returns question primitives on success", async () => {
    questionRepo.findByIdString.mockResolvedValue(makeQuestion())
    questionRepo.save.mockResolvedValue(undefined)

    const result = await useCase.execute("id", {
      question: "Updated question?",
      difficulty: "hard",
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.value.question).toBe("Updated question?")
      expect(result.value.difficulty).toBe("hard")
    }
    expect(questionRepo.save).toHaveBeenCalledOnce()
  })

  it("returns unchanged fields when partial update is applied", async () => {
    questionRepo.findByIdString.mockResolvedValue(makeQuestion())
    questionRepo.save.mockResolvedValue(undefined)

    const result = await useCase.execute("id", { correctIndex: 2 })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.value.correctIndex).toBe(2)
      expect(result.value.type).toBe("basic")
    }
  })
})

describe("DeleteQuestionUseCase", () => {
  const questionRepo = makeQuestionRepo()
  const useCase = new DeleteQuestionUseCase(questionRepo)

  beforeEach(() => vi.clearAllMocks())

  it("returns NotFoundError when delete returns false", async () => {
    questionRepo.delete.mockResolvedValue(false)
    const result = await useCase.execute("non-existent-id")
    expect(result.success).toBe(false)
    if (!result.success) expect(result.error.name).toBe("NotFoundError")
  })

  it("returns ok when deletion succeeds", async () => {
    questionRepo.delete.mockResolvedValue(true)
    const result = await useCase.execute("valid-id")
    expect(result.success).toBe(true)
    expect(questionRepo.delete).toHaveBeenCalledOnce()
  })
})
