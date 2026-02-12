import { QuizSession } from "@/domain/quiz/entities/QuizSession"
import { QuizQuestion } from "@/domain/quiz/entities/QuizQuestion"
import { IQuizSessionRepository } from "@/domain/quiz/repositories/IQuizSessionRepository"
import { IQuizQuestionRepository } from "@/domain/quiz/repositories/IQuizQuestionRepository"
import { QuizSessionId } from "@/domain/quiz/value-objects"
import { AlumniId } from "@/domain/alumni/value-objects"
import { createServerSupabaseClient } from "@/infrastructure/supabase"

export class SupabaseQuizSessionRepository implements IQuizSessionRepository {
  constructor(private quizQuestionRepository: IQuizQuestionRepository) {}

  private get supabase() {
    return createServerSupabaseClient()
  }

  async findById(id: QuizSessionId): Promise<QuizSession | null> {
    return this.findByIdString(id.getValue())
  }

  async findByIdString(id: string): Promise<QuizSession | null> {
    const { data, error } = await this.supabase
      .from("quiz_sessions")
      .select("*")
      .eq("id", id)
      .single()

    if (error || !data) return null
    return await this.toDomain(data)
  }

  async findByEmail(email: string): Promise<QuizSession | null> {
    const { data, error } = await this.supabase
      .from("quiz_sessions")
      .select("*")
      .eq("email", email.toLowerCase())
      .order("created_at", { ascending: false })
      .limit(1)
      .single()

    if (error || !data) return null
    return await this.toDomain(data)
  }

  async save(session: QuizSession): Promise<void> {
    const { error } = await this.supabase.from("quiz_sessions").upsert({
      id: session.sessionId.getValue(),
      email: session.email,
      alumni_id: session.alumniId?.getValue() || null,
      alumni_matched: session.alumniMatched,
      question_ids: session.questions.map((q) => q.id.getValue()),
      attempt_count: session.attemptCount,
      max_attempts: session.maxAttempts,
      expires_at: session.expiresAt.toISOString(),
      created_at: session.createdAt.toISOString(),
    })

    if (error) {
      throw new Error(`Failed to save quiz session: ${error.message}`)
    }
  }

  async delete(id: QuizSessionId): Promise<boolean> {
    const { error } = await this.supabase
      .from("quiz_sessions")
      .delete()
      .eq("id", id.getValue())

    return !error
  }

  private async toDomain(row: {
    id: string
    email: string
    alumni_id: string | null
    alumni_matched: boolean
    question_ids: string[]
    attempt_count: number
    max_attempts: number
    expires_at: string
    created_at: string
  }): Promise<QuizSession | null> {
    // Load questions from repository
    const questions: QuizQuestion[] = []
    for (const qId of row.question_ids) {
      const question = await this.quizQuestionRepository.findByIdString(qId)
      if (question) {
        questions.push(question)
      }
    }

    return QuizSession.reconstitute({
      sessionId: QuizSessionId.create(row.id),
      email: row.email,
      alumniId: row.alumni_id ? AlumniId.create(row.alumni_id) : undefined,
      alumniMatched: row.alumni_matched,
      questions,
      attemptCount: row.attempt_count,
      maxAttempts: row.max_attempts,
      expiresAt: new Date(row.expires_at),
      createdAt: new Date(row.created_at),
    })
  }
}
