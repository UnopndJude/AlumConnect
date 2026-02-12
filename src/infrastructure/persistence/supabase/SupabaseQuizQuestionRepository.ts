import { QuizQuestion } from "@/domain/quiz/entities/QuizQuestion"
import { IQuizQuestionRepository } from "@/domain/quiz/repositories/IQuizQuestionRepository"
import {
  QuizQuestionId,
  QuestionType,
  QuestionTypeValue,
  Difficulty,
  DifficultyValue,
} from "@/domain/quiz/value-objects"
import { createServerSupabaseClient } from "@/infrastructure/supabase"

export class SupabaseQuizQuestionRepository implements IQuizQuestionRepository {
  private get supabase() {
    return createServerSupabaseClient()
  }

  async findById(id: QuizQuestionId): Promise<QuizQuestion | null> {
    return this.findByIdString(id.getValue())
  }

  async findByIdString(id: string): Promise<QuizQuestion | null> {
    const { data, error } = await this.supabase
      .from("quiz_questions")
      .select("*")
      .eq("id", id)
      .single()

    if (error || !data) return null
    return this.toDomain(data)
  }

  async findAll(): Promise<QuizQuestion[]> {
    const { data, error } = await this.supabase
      .from("quiz_questions")
      .select("*")

    if (error || !data) return []
    return data.map((row) => this.toDomain(row))
  }

  async findByType(type: QuestionType): Promise<QuizQuestion[]> {
    const { data, error } = await this.supabase
      .from("quiz_questions")
      .select("*")
      .eq("type", type.getValue())

    if (error || !data) return []
    return data.map((row) => this.toDomain(row))
  }

  async findByDifficulty(difficulty: Difficulty): Promise<QuizQuestion[]> {
    const { data, error } = await this.supabase
      .from("quiz_questions")
      .select("*")
      .eq("difficulty", difficulty.getValue())

    if (error || !data) return []
    return data.map((row) => this.toDomain(row))
  }

  async findRandom(count: number): Promise<QuizQuestion[]> {
    // Supabase doesn't have native random ordering, so we fetch all and shuffle
    const { data, error } = await this.supabase
      .from("quiz_questions")
      .select("*")

    if (error || !data) return []

    // Fisher-Yates shuffle
    const shuffled = [...data]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }

    return shuffled.slice(0, count).map((row) => this.toDomain(row))
  }

  async save(question: QuizQuestion): Promise<void> {
    const primitives = question.toPrimitives()

    const { error } = await this.supabase.from("quiz_questions").upsert({
      id: primitives.id,
      type: primitives.type,
      question: primitives.question,
      options: primitives.options,
      correct_index: primitives.correctIndex,
      difficulty: primitives.difficulty,
      applicable_class_from: primitives.applicableClasses?.from || null,
      applicable_class_to: primitives.applicableClasses?.to || null,
    })

    if (error) {
      throw new Error(`Failed to save quiz question: ${error.message}`)
    }
  }

  async delete(id: QuizQuestionId): Promise<boolean> {
    const { error } = await this.supabase
      .from("quiz_questions")
      .delete()
      .eq("id", id.getValue())

    return !error
  }

  async count(): Promise<number> {
    const { count, error } = await this.supabase
      .from("quiz_questions")
      .select("*", { count: "exact", head: true })

    if (error) return 0
    return count || 0
  }

  private toDomain(row: {
    id: string
    type: string
    question: string
    options: string[]
    correct_index: number
    difficulty: string
    applicable_class_from: number | null
    applicable_class_to: number | null
  }): QuizQuestion {
    return QuizQuestion.reconstitute({
      id: QuizQuestionId.create(row.id),
      type: QuestionType.fromString(row.type as QuestionTypeValue),
      question: row.question,
      options: row.options,
      correctIndex: row.correct_index,
      difficulty: Difficulty.fromString(row.difficulty as DifficultyValue),
      applicableClasses:
        row.applicable_class_from && row.applicable_class_to
          ? { from: row.applicable_class_from, to: row.applicable_class_to }
          : undefined,
    })
  }
}
