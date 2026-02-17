import { describe, it, expect, beforeEach, vi } from "vitest"
import { POST } from "@/app/api/onboarding/route"
import { NextRequest } from "next/server"
import { AlumniMatchResult } from "@/domain/alumni/entities/AlumniMatchResult"
import { AlumniId } from "@/domain/alumni/value-objects"

// Mock the Supabase client
vi.mock("@/infrastructure/supabase", () => ({
  createServerClient: vi.fn(),
}))

// Mock the container
vi.mock("@/infrastructure/di/container", () => ({
  container: {
    getAlumniMatchingService: vi.fn(),
    getProfileRepository: vi.fn(),
  },
}))

import { createServerClient } from "@/infrastructure/supabase"
import { container } from "@/infrastructure/di/container"

const mockAlumniMatchingService = {
  match: vi.fn(),
}

const mockProfileRepository = {
  save: vi.fn(),
}

const mockSupabase = {
  auth: {
    getSession: vi.fn(),
  },
  from: vi.fn(),
}

const mockedCreateServerClient = createServerClient as ReturnType<typeof vi.fn>

describe("/api/onboarding", () => {
  beforeEach(() => {
    vi.clearAllMocks()

    mockedCreateServerClient.mockResolvedValue(
      mockSupabase as unknown as Awaited<ReturnType<typeof createServerClient>>
    )
    vi.mocked(container.getAlumniMatchingService).mockReturnValue(
      mockAlumniMatchingService as unknown as ReturnType<
        typeof container.getAlumniMatchingService
      >
    )
    vi.mocked(container.getProfileRepository).mockReturnValue(
      mockProfileRepository as unknown as ReturnType<
        typeof container.getProfileRepository
      >
    )
  })

  const createMockRequest = (body: Record<string, unknown>) => {
    return new NextRequest("http://localhost:3000/api/onboarding", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })
  }

  it("should return 401 if user is not authenticated", async () => {
    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: null },
    })

    const request = createMockRequest({
      name: "홍길동",
      graduationClass: 10,
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.success).toBe(false)
    expect(data.message).toBe("로그인이 필요합니다.")
  })

  it("should return 400 if profile already exists", async () => {
    mockSupabase.auth.getSession.mockResolvedValue({
      data: {
        session: {
          user: {
            id: "user-123",
            email: "test@example.com",
          },
        },
      },
    })

    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: {
              id: "user-123",
              name: "홍길동",
              graduation_class: 10,
            },
          }),
        }),
      }),
    })

    const request = createMockRequest({
      name: "홍길동",
      graduationClass: 10,
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
    expect(data.message).toBe("이미 프로필이 존재합니다.")
  })

  it("should return 400 if required fields are missing", async () => {
    mockSupabase.auth.getSession.mockResolvedValue({
      data: {
        session: {
          user: {
            id: "user-123",
            email: "test@example.com",
          },
        },
      },
    })

    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: null,
          }),
        }),
      }),
    })

    const request = createMockRequest({
      name: "",
      graduationClass: null,
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
    expect(data.message).toBe("이름과 기수를 입력해주세요.")
  })

  it("should return 404 if alumni match not found", async () => {
    mockSupabase.auth.getSession.mockResolvedValue({
      data: {
        session: {
          user: {
            id: "user-123",
            email: "test@example.com",
          },
        },
      },
    })

    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: null,
          }),
        }),
      }),
    })

    mockAlumniMatchingService.match.mockResolvedValue(
      AlumniMatchResult.noMatch()
    )

    const request = createMockRequest({
      name: "홍길동",
      graduationClass: 10,
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data.success).toBe(false)
    expect(data.message).toContain("동문 DB에서 찾을 수 없습니다")
  })

  it("should create profile successfully with alumni match", async () => {
    mockSupabase.auth.getSession.mockResolvedValue({
      data: {
        session: {
          user: {
            id: "user-123",
            email: "test@example.com",
          },
        },
      },
    })

    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: null,
          }),
        }),
      }),
    })

    const alumniId = AlumniId.create("alumni-123")
    mockAlumniMatchingService.match.mockResolvedValue(
      AlumniMatchResult.exactMatch(alumniId)
    )

    mockProfileRepository.save.mockResolvedValue(undefined)

    const request = createMockRequest({
      name: "홍길동",
      graduationClass: 10,
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.message).toBe("프로필이 생성되었습니다.")
    expect(data.profile).toBeDefined()
    expect(data.profile.name).toBe("홍길동")
    expect(data.profile.graduationClass).toBe(10)
    expect(data.profile.alumniId).toBe("alumni-123")
    expect(mockProfileRepository.save).toHaveBeenCalled()
  })

  it("should return 400 if graduation class is invalid", async () => {
    mockSupabase.auth.getSession.mockResolvedValue({
      data: {
        session: {
          user: {
            id: "user-123",
            email: "test@example.com",
          },
        },
      },
    })

    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: null,
          }),
        }),
      }),
    })

    const request = createMockRequest({
      name: "홍길동",
      graduationClass: 100, // Invalid: exceeds max of 50
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
    expect(data.message).toContain("기수는")
  })
})
