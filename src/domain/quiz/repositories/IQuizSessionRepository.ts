import { QuizSession } from "../entities/QuizSession"
import { QuizSessionId } from "../value-objects"

export interface IQuizSessionRepository {
  findById(id: QuizSessionId): Promise<QuizSession | null>
  findByIdString(id: string): Promise<QuizSession | null>
  findByEmail(email: string): Promise<QuizSession | null>
  save(session: QuizSession): Promise<void>
  delete(id: QuizSessionId): Promise<boolean>
}
