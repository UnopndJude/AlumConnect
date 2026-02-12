import { IUserRepository } from "@/domain/user/repositories/IUserRepository"
import { IAlumniRepository } from "@/domain/alumni/repositories/IAlumniRepository"
import { IQuizQuestionRepository } from "@/domain/quiz/repositories/IQuizQuestionRepository"
import { IQuizSessionRepository } from "@/domain/quiz/repositories/IQuizSessionRepository"
import { IIntroductionRepository } from "@/domain/introduction/repositories/IIntroductionRepository"
import { IProfileRepository } from "@/domain/profile/repositories/IProfileRepository"
import { INewsletterRepository } from "@/domain/newsletter/repositories/INewsletterRepository"
import { ISubscriptionRepository } from "@/domain/subscription/repositories/ISubscriptionRepository"
import { IAnnouncementRepository } from "@/domain/announcement/repositories/IAnnouncementRepository"
import { IConnectionRepository } from "@/domain/connection/repositories/IConnectionRepository"
import { PasswordHasher } from "@/domain/user/value-objects/Password"
import { IEmailService } from "@/domain/email/services/IEmailService"

// In-memory repositories (for testing)
import { InMemoryUserRepository } from "../persistence/in-memory/InMemoryUserRepository"
import { InMemoryAlumniRepository } from "../persistence/in-memory/InMemoryAlumniRepository"
import { InMemoryQuizQuestionRepository } from "../persistence/in-memory/InMemoryQuizQuestionRepository"
import { InMemoryQuizSessionRepository } from "../persistence/in-memory/InMemoryQuizSessionRepository"
import { InMemoryIntroductionRepository } from "../persistence/in-memory/InMemoryIntroductionRepository"
import { InMemoryProfileRepository } from "../persistence/in-memory/InMemoryProfileRepository"
import { InMemoryNewsletterRepository } from "../persistence/in-memory/InMemoryNewsletterRepository"
import { InMemorySubscriptionRepository } from "../persistence/in-memory/InMemorySubscriptionRepository"
import { InMemoryAnnouncementRepository } from "../persistence/in-memory/InMemoryAnnouncementRepository"
import { InMemoryConnectionRepository } from "../persistence/in-memory/InMemoryConnectionRepository"

// Supabase repositories (for production)
import { SupabaseUserRepository } from "../persistence/supabase/SupabaseUserRepository"
import { SupabaseAlumniRepository } from "../persistence/supabase/SupabaseAlumniRepository"
import { SupabaseQuizQuestionRepository } from "../persistence/supabase/SupabaseQuizQuestionRepository"
import { SupabaseQuizSessionRepository } from "../persistence/supabase/SupabaseQuizSessionRepository"
import { SupabaseIntroductionRepository } from "../persistence/supabase/SupabaseIntroductionRepository"
import { SupabaseProfileRepository } from "../persistence/supabase/SupabaseProfileRepository"
import { SupabaseNewsletterRepository } from "../persistence/supabase/SupabaseNewsletterRepository"
import { SupabaseSubscriptionRepository } from "../persistence/supabase/SupabaseSubscriptionRepository"
import { SupabaseAnnouncementRepository } from "../persistence/supabase/SupabaseAnnouncementRepository"
import { SupabaseConnectionRepository } from "../persistence/supabase/SupabaseConnectionRepository"

import { BcryptPasswordService } from "../services/BcryptPasswordService"
import { ResendEmailService } from "../email/ResendEmailService"
import { ConsoleEmailService } from "../email/ConsoleEmailService"

import { AlumniMatchingService } from "@/domain/alumni/services/AlumniMatchingService"
import { QuizGradingService } from "@/domain/quiz/services/QuizGradingService"
import { QuizConfig } from "@/domain/quiz/entities/QuizSession"

// Check if Supabase is configured
const useSupabase = !!(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// Singleton instances
let userRepository: IUserRepository | null = null
let alumniRepository: IAlumniRepository | null = null
let quizQuestionRepository: IQuizQuestionRepository | null = null
let quizSessionRepository: IQuizSessionRepository | null = null
let introductionRepository: IIntroductionRepository | null = null
let profileRepository: IProfileRepository | null = null
let newsletterRepository: INewsletterRepository | null = null
let subscriptionRepository: ISubscriptionRepository | null = null
let announcementRepository: IAnnouncementRepository | null = null
let connectionRepository: IConnectionRepository | null = null
let passwordHasher: PasswordHasher | null = null
let emailService: IEmailService | null = null

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
      userRepository = useSupabase
        ? new SupabaseUserRepository()
        : new InMemoryUserRepository()
    }
    return userRepository
  },

  getAlumniRepository(): IAlumniRepository {
    if (!alumniRepository) {
      alumniRepository = useSupabase
        ? new SupabaseAlumniRepository()
        : new InMemoryAlumniRepository()
    }
    return alumniRepository
  },

  getQuizQuestionRepository(): IQuizQuestionRepository {
    if (!quizQuestionRepository) {
      quizQuestionRepository = useSupabase
        ? new SupabaseQuizQuestionRepository()
        : new InMemoryQuizQuestionRepository()
    }
    return quizQuestionRepository
  },

  getQuizSessionRepository(): IQuizSessionRepository {
    if (!quizSessionRepository) {
      quizSessionRepository = useSupabase
        ? new SupabaseQuizSessionRepository(this.getQuizQuestionRepository())
        : new InMemoryQuizSessionRepository()
    }
    return quizSessionRepository
  },

  getIntroductionRepository(): IIntroductionRepository {
    if (!introductionRepository) {
      introductionRepository = useSupabase
        ? new SupabaseIntroductionRepository()
        : new InMemoryIntroductionRepository()
    }
    return introductionRepository
  },

  getProfileRepository(): IProfileRepository {
    if (!profileRepository) {
      profileRepository = useSupabase
        ? new SupabaseProfileRepository()
        : new InMemoryProfileRepository()
    }
    return profileRepository
  },

  getNewsletterRepository(): INewsletterRepository {
    if (!newsletterRepository) {
      newsletterRepository = useSupabase
        ? new SupabaseNewsletterRepository()
        : new InMemoryNewsletterRepository()
    }
    return newsletterRepository
  },

  getSubscriptionRepository(): ISubscriptionRepository {
    if (!subscriptionRepository) {
      subscriptionRepository = useSupabase
        ? new SupabaseSubscriptionRepository()
        : new InMemorySubscriptionRepository()
    }
    return subscriptionRepository
  },

  getAnnouncementRepository(): IAnnouncementRepository {
    if (!announcementRepository) {
      announcementRepository = useSupabase
        ? new SupabaseAnnouncementRepository()
        : new InMemoryAnnouncementRepository()
    }
    return announcementRepository
  },

  getConnectionRepository(): IConnectionRepository {
    if (!connectionRepository) {
      connectionRepository = useSupabase
        ? new SupabaseConnectionRepository()
        : new InMemoryConnectionRepository()
    }
    return connectionRepository
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

  getEmailService(): IEmailService {
    if (!emailService) {
      const hasResendKey = !!process.env.RESEND_API_KEY
      emailService = hasResendKey
        ? new ResendEmailService()
        : new ConsoleEmailService()
    }
    return emailService
  },
}
