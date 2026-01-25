import { IUserRepository } from "@/domain/user/repositories/IUserRepository"
import { IAlumniRepository } from "@/domain/alumni/repositories/IAlumniRepository"
import { IQuizQuestionRepository } from "@/domain/quiz/repositories/IQuizQuestionRepository"
import { IQuizSessionRepository } from "@/domain/quiz/repositories/IQuizSessionRepository"
import { IIntroductionRepository } from "@/domain/introduction/repositories/IIntroductionRepository"
import { PasswordHasher } from "@/domain/user/value-objects/Password"

import { InMemoryUserRepository } from "../persistence/in-memory/InMemoryUserRepository"
import { InMemoryAlumniRepository } from "../persistence/in-memory/InMemoryAlumniRepository"
import { InMemoryQuizQuestionRepository } from "../persistence/in-memory/InMemoryQuizQuestionRepository"
import { InMemoryQuizSessionRepository } from "../persistence/in-memory/InMemoryQuizSessionRepository"
import { InMemoryIntroductionRepository } from "../persistence/in-memory/InMemoryIntroductionRepository"
import { BcryptPasswordService } from "../services/BcryptPasswordService"

import { AlumniMatchingService } from "@/domain/alumni/services/AlumniMatchingService"
import { QuizGradingService } from "@/domain/quiz/services/QuizGradingService"
import { QuizConfig } from "@/domain/quiz/entities/QuizSession"

// Singleton instances
let userRepository: IUserRepository | null = null
let alumniRepository: IAlumniRepository | null = null
let quizQuestionRepository: IQuizQuestionRepository | null = null
let quizSessionRepository: IQuizSessionRepository | null = null
let introductionRepository: IIntroductionRepository | null = null
let passwordHasher: PasswordHasher | null = null

const quizConfig: QuizConfig = {
  questionsPerSession: 5,
  passingScore: 4,
  maxAttempts: 3,
  sessionDurationMinutes: 30,
}

export const container = {
  // Repositories
  getUserRepository(): IUserRepository {
    if (!userRepository) {
      userRepository = new InMemoryUserRepository()
    }
    return userRepository
  },

  getAlumniRepository(): IAlumniRepository {
    if (!alumniRepository) {
      alumniRepository = new InMemoryAlumniRepository()
    }
    return alumniRepository
  },

  getQuizQuestionRepository(): IQuizQuestionRepository {
    if (!quizQuestionRepository) {
      quizQuestionRepository = new InMemoryQuizQuestionRepository()
    }
    return quizQuestionRepository
  },

  getQuizSessionRepository(): IQuizSessionRepository {
    if (!quizSessionRepository) {
      quizSessionRepository = new InMemoryQuizSessionRepository()
    }
    return quizSessionRepository
  },

  getIntroductionRepository(): IIntroductionRepository {
    if (!introductionRepository) {
      introductionRepository = new InMemoryIntroductionRepository()
    }
    return introductionRepository
  },

  // Services
  getPasswordHasher(): PasswordHasher {
    if (!passwordHasher) {
      passwordHasher = new BcryptPasswordService()
    }
    return passwordHasher
  },

  getAlumniMatchingService(): AlumniMatchingService {
    return new AlumniMatchingService(this.getAlumniRepository())
  },

  getQuizGradingService(): QuizGradingService {
    return new QuizGradingService(quizConfig)
  },

  getQuizConfig(): QuizConfig {
    return { ...quizConfig }
  },
}
