import { AlumniId } from "@/domain/alumni/value-objects"
import { QuizSessionId, QuizScore } from "../value-objects"
import { QuizQuestion } from "./QuizQuestion"

export interface QuizConfig {
  questionsPerSession: number
  passingScore: number
  maxAttempts: number
  sessionDurationMinutes: number
}

export interface QuizSessionProps {
  sessionId: QuizSessionId
  email: string
  alumniId?: AlumniId
  alumniMatched: boolean
  questions: QuizQuestion[]
  attemptCount: number
  maxAttempts: number
  expiresAt: Date
  createdAt: Date
}

export class QuizSession {
  private constructor(private props: QuizSessionProps) {}

  static create(
    email: string,
    alumniMatched: boolean,
    questions: QuizQuestion[],
    config: QuizConfig,
    alumniId?: AlumniId
  ): QuizSession {
    return new QuizSession({
      sessionId: QuizSessionId.create(),
      email,
      alumniId,
      alumniMatched,
      questions,
      attemptCount: 0,
      maxAttempts: config.maxAttempts,
      expiresAt: new Date(
        Date.now() + config.sessionDurationMinutes * 60 * 1000
      ),
      createdAt: new Date(),
    })
  }

  static reconstitute(props: QuizSessionProps): QuizSession {
    return new QuizSession(props)
  }

  get sessionId(): QuizSessionId {
    return this.props.sessionId
  }

  get email(): string {
    return this.props.email
  }

  get alumniId(): AlumniId | undefined {
    return this.props.alumniId
  }

  get alumniMatched(): boolean {
    return this.props.alumniMatched
  }

  get questions(): QuizQuestion[] {
    return [...this.props.questions]
  }

  get attemptCount(): number {
    return this.props.attemptCount
  }

  get maxAttempts(): number {
    return this.props.maxAttempts
  }

  get expiresAt(): Date {
    return this.props.expiresAt
  }

  get createdAt(): Date {
    return this.props.createdAt
  }

  isExpired(): boolean {
    return this.props.expiresAt < new Date()
  }

  hasAttemptsRemaining(): boolean {
    return this.props.attemptCount < this.props.maxAttempts
  }

  getAttemptsRemaining(): number {
    return this.props.maxAttempts - this.props.attemptCount
  }

  incrementAttempt(): void {
    this.props.attemptCount++
  }

  updateQuestions(questions: QuizQuestion[]): void {
    this.props.questions = questions
  }

  grade(answers: number[], passingScore: number): QuizScore {
    let correct = 0
    for (let i = 0; i < this.props.questions.length; i++) {
      if (this.props.questions[i].isCorrect(answers[i])) {
        correct++
      }
    }
    return QuizScore.create(correct, this.props.questions.length, passingScore)
  }

  canAutoApprove(quizPassed: boolean): boolean {
    return quizPassed && this.props.alumniMatched
  }
}
