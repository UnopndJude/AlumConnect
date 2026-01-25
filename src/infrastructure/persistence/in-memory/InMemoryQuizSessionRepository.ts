import { QuizSession } from "@/domain/quiz/entities/QuizSession"
import { IQuizSessionRepository } from "@/domain/quiz/repositories/IQuizSessionRepository"
import { QuizSessionId } from "@/domain/quiz/value-objects"

const sessions: Map<string, QuizSession> = new Map()

export class InMemoryQuizSessionRepository implements IQuizSessionRepository {
  async findById(id: QuizSessionId): Promise<QuizSession | null> {
    return sessions.get(id.getValue()) || null
  }

  async findByIdString(id: string): Promise<QuizSession | null> {
    return sessions.get(id) || null
  }

  async findByEmail(email: string): Promise<QuizSession | null> {
    for (const session of sessions.values()) {
      if (session.email === email) {
        return session
      }
    }
    return null
  }

  async save(session: QuizSession): Promise<void> {
    sessions.set(session.sessionId.getValue(), session)
  }

  async delete(id: QuizSessionId): Promise<boolean> {
    return sessions.delete(id.getValue())
  }
}
