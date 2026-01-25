import { QuizQuestion } from "../entities/QuizQuestion"
import { QuizQuestionId, QuestionType, Difficulty } from "../value-objects"

export interface IQuizQuestionRepository {
  findById(id: QuizQuestionId): Promise<QuizQuestion | null>
  findByIdString(id: string): Promise<QuizQuestion | null>
  findAll(): Promise<QuizQuestion[]>
  findByType(type: QuestionType): Promise<QuizQuestion[]>
  findByDifficulty(difficulty: Difficulty): Promise<QuizQuestion[]>
  findRandom(count: number): Promise<QuizQuestion[]>
  save(question: QuizQuestion): Promise<void>
  delete(id: QuizQuestionId): Promise<boolean>
  count(): Promise<number>
}
