import { describe, it, expect, vi, beforeEach } from "vitest"
import { POST } from "@/app/api/verify/quiz/route"
import { NextRequest } from "next/server"

// Mock the dependencies
vi.mock("@/infrastructure/supabase", () => ({
  createServerClient: vi.fn(),
}))

vi.mock("@/infrastructure/di/container", () => ({
  container: {
    getQuizSessionRepository: vi.fn(),
    getQuizQuestionRepository: vi.fn(),
    getProfileRepository: vi.fn(),
    getQuizGradingService: vi.fn(),
    getQuizConfig: vi.fn(),
  },
}))

import { createServerClient } from "@/infrastructure/supabase"
import { container } from "@/infrastructure/di/container"

describe("/api/verify/quiz POST", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("should return 401 if not authenticated", async () => {
    const mockSupabase = {
      auth: {
        getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
      },
    }
    vi.mocked(createServerClient).mockResolvedValue(mockSupabase as any)

    const request = new NextRequest("http://localhost/api/verify/quiz", {
      method: "POST",
      body: JSON.stringify({
        sessionId: "test-session",
        answers: [0, 1, 2, 3, 4],
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.success).toBe(false)
    expect(data.message).toBe("로그인이 필요합니다.")
  })

  it("should return 404 if profile not found", async () => {
    const mockSupabase = {
      auth: {
        getSession: vi.fn().mockResolvedValue({
          data: {
            session: { user: { id: "test-user-id", email: "test@test.com" } },
          },
        }),
      },
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null }),
    }
    vi.mocked(createServerClient).mockResolvedValue(mockSupabase as any)

    const request = new NextRequest("http://localhost/api/verify/quiz", {
      method: "POST",
      body: JSON.stringify({
        sessionId: "test-session",
        answers: [0, 1, 2, 3, 4],
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data.success).toBe(false)
    expect(data.message).toBe("프로필을 찾을 수 없습니다.")
  })

  it("should return 400 if already verified", async () => {
    const mockSupabase = {
      auth: {
        getSession: vi.fn().mockResolvedValue({
          data: {
            session: { user: { id: "test-user-id", email: "test@test.com" } },
          },
        }),
      },
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi
        .fn()
        .mockResolvedValue({ data: { id: "test-user-id", is_verified: true } }),
    }
    vi.mocked(createServerClient).mockResolvedValue(mockSupabase as any)

    const request = new NextRequest("http://localhost/api/verify/quiz", {
      method: "POST",
      body: JSON.stringify({
        sessionId: "test-session",
        answers: [0, 1, 2, 3, 4],
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
    expect(data.message).toBe("이미 인증된 프로필입니다.")
    expect(data.verified).toBe(true)
  })

  it("should verify profile when quiz is passed", async () => {
    const mockSupabase = {
      auth: {
        getSession: vi.fn().mockResolvedValue({
          data: {
            session: { user: { id: "test-user-id", email: "test@test.com" } },
          },
        }),
      },
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: { id: "test-user-id", is_verified: false },
      }),
    }
    vi.mocked(createServerClient).mockResolvedValue(mockSupabase as any)

    // Mock QuizSession entity
    const mockQuizSession = {
      sessionId: { getValue: () => "test-session" },
      questions: Array(5).fill({ isCorrect: () => true }),
      isExpired: vi.fn().mockReturnValue(false),
      hasAttemptsRemaining: vi.fn().mockReturnValue(true),
      incrementAttempt: vi.fn(),
      grade: vi.fn().mockReturnValue({
        getCorrect: () => 5,
        getTotal: () => 5,
        passed: () => true,
      }),
      getAttemptsRemaining: vi.fn().mockReturnValue(2),
    }

    // Mock Profile entity
    const mockProfile = {
      id: { getValue: () => "test-user-id" },
      verify: vi.fn(),
    }

    // Mock repositories with proper methods
    const mockQuizSessionRepository = {
      findByIdString: vi.fn().mockResolvedValue(mockQuizSession),
      save: vi.fn().mockResolvedValue(undefined),
    }

    const mockProfileRepository = {
      findById: vi.fn().mockResolvedValue(mockProfile),
      save: vi.fn().mockResolvedValue(undefined),
    }

    const mockQuizQuestionRepository = {
      findRandom: vi.fn().mockResolvedValue([]),
    }

    const mockGradingService = {
      grade: vi.fn().mockReturnValue({
        success: true,
        score: {
          getCorrect: () => 5,
          getTotal: () => 5,
          passed: () => true,
        },
        passed: true,
        attemptsRemaining: 2,
        message: "축하합니다! 5/5 문제를 맞추셨습니다.",
      }),
    }

    vi.mocked(container.getQuizSessionRepository).mockReturnValue(
      mockQuizSessionRepository as any
    )
    vi.mocked(container.getQuizQuestionRepository).mockReturnValue(
      mockQuizQuestionRepository as any
    )
    vi.mocked(container.getProfileRepository).mockReturnValue(
      mockProfileRepository as any
    )
    vi.mocked(container.getQuizGradingService).mockReturnValue(
      mockGradingService as any
    )
    vi.mocked(container.getQuizConfig).mockReturnValue({
      questionsPerSession: 5,
      passingScore: 4,
      maxAttempts: 3,
      sessionDurationMinutes: 30,
    })

    const request = new NextRequest("http://localhost/api/verify/quiz", {
      method: "POST",
      body: JSON.stringify({
        sessionId: "test-session",
        answers: [0, 1, 2, 3, 4],
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.verified).toBe(true)
    expect(data.passed).toBe(true)
  })
})
