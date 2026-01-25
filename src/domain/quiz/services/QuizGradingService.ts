import { QuizSession, QuizConfig } from "../entities/QuizSession"
import { QuizScore } from "../value-objects"

export interface QuizSubmitResult {
  success: boolean
  score: QuizScore
  passed: boolean
  attemptsRemaining: number
  message: string
}

export class QuizGradingService {
  constructor(private readonly config: QuizConfig) {}

  grade(session: QuizSession, answers: number[]): QuizSubmitResult {
    if (session.isExpired()) {
      return {
        success: false,
        score: QuizScore.create(
          0,
          session.questions.length,
          this.config.passingScore
        ),
        passed: false,
        attemptsRemaining: 0,
        message: "퀴즈 세션이 만료되었습니다. 다시 시작해주세요.",
      }
    }

    if (!session.hasAttemptsRemaining()) {
      return {
        success: false,
        score: QuizScore.create(
          0,
          session.questions.length,
          this.config.passingScore
        ),
        passed: false,
        attemptsRemaining: 0,
        message: "최대 시도 횟수를 초과했습니다.",
      }
    }

    session.incrementAttempt()
    const score = session.grade(answers, this.config.passingScore)
    const passed = score.passed()
    const attemptsRemaining = session.getAttemptsRemaining()

    if (passed) {
      return {
        success: true,
        score,
        passed: true,
        attemptsRemaining,
        message: `축하합니다! ${score.getCorrect()}/${score.getTotal()} 문제를 맞추셨습니다.`,
      }
    }

    if (attemptsRemaining > 0) {
      return {
        success: true,
        score,
        passed: false,
        attemptsRemaining,
        message: `${score.getCorrect()}/${score.getTotal()} 문제를 맞추셨습니다. ${attemptsRemaining}번의 기회가 남았습니다.`,
      }
    }

    return {
      success: true,
      score,
      passed: false,
      attemptsRemaining: 0,
      message: `${score.getCorrect()}/${score.getTotal()} 문제를 맞추셨습니다. 더 이상 시도할 수 없습니다.`,
    }
  }

  getConfig(): QuizConfig {
    return { ...this.config }
  }
}
