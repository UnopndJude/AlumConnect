import { describe, it, expect, beforeEach, vi } from "vitest"
import { GET } from "@/app/api/directory/route"
import { NextRequest } from "next/server"

// Mock the auth middleware
vi.mock("@/infrastructure/auth/middleware", () => ({
  requireAuth: vi.fn(),
}))

// Mock the container
vi.mock("@/infrastructure/di/container", () => ({
  container: {
    getProfileRepository: vi.fn(),
  },
}))

import { requireAuth } from "@/infrastructure/auth/middleware"
import { container } from "@/infrastructure/di/container"
import { NextResponse } from "next/server"

const mockRequireAuth = vi.mocked(requireAuth)
const mockGetProfileRepository = vi.mocked(container.getProfileRepository)

describe("/api/directory - GET", () => {
  const mockProfileRepository = {
    findAll: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockGetProfileRepository.mockReturnValue(
      mockProfileRepository as unknown as ReturnType<
        typeof container.getProfileRepository
      >
    )
  })

  const createMockRequest = (params: Record<string, string> = {}) => {
    const url = new URL("http://localhost:3000/api/directory")
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value)
    })
    return new NextRequest(url.toString())
  }

  it("should return 401 when user is not authenticated", async () => {
    mockRequireAuth.mockResolvedValue({
      success: false,
      response: NextResponse.json(
        { success: false, message: "로그인이 필요합니다." },
        { status: 401 }
      ),
    })

    const request = createMockRequest()
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.success).toBe(false)
  })

  it("should return 404 when user has no profile", async () => {
    mockRequireAuth.mockResolvedValue({
      success: true,
      auth: {
        user: { id: "user-1", email: "test@example.com" },
        profile: null,
      },
    })

    const request = createMockRequest()
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data.success).toBe(false)
    expect(data.message).toBe("Profile not found.")
  })

  it("should return limited data for non-verified users", async () => {
    mockRequireAuth.mockResolvedValue({
      success: true,
      auth: {
        user: { id: "user-1", email: "test@example.com" },
        profile: {
          id: "profile-1",
          email: "test@example.com",
          name: "테스트",
          graduationClass: 5,
          isVerified: false,
          isAdmin: false,
          alumniId: null,
        },
      },
    })

    const mockProfiles = [
      {
        id: { getValue: () => "profile-2" },
        name: "홍길동",
        graduationClass: { getValue: () => 6 },
        email: { getValue: () => "hong@example.com" },
        isVerified: true,
        alumniId: "alumni-1",
        toPrimitives: () => ({
          id: "profile-2",
          name: "홍길동",
          graduationClass: 6,
          email: "hong@example.com",
          isVerified: true,
          isAdmin: false,
          alumniId: "alumni-1",
          createdAt: new Date(),
        }),
      },
    ]

    mockProfileRepository.findAll.mockResolvedValue({
      items: mockProfiles,
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    })

    const request = createMockRequest()
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.data.isVerified).toBe(false)
    expect(data.data.profiles).toHaveLength(1)

    // Non-verified users should only see limited data
    const profile = data.data.profiles[0]
    expect(profile.id).toBe("profile-2")
    expect(profile.name).toBe("홍길동")
    expect(profile.graduationClass).toBe(6)
    expect(profile.isVerified).toBe(true)
    expect(profile.email).toBeUndefined()
    expect(profile.alumniId).toBeUndefined()
  })

  it("should return full data for verified users", async () => {
    mockRequireAuth.mockResolvedValue({
      success: true,
      auth: {
        user: { id: "user-1", email: "test@example.com" },
        profile: {
          id: "profile-1",
          email: "test@example.com",
          name: "테스트",
          graduationClass: 5,
          isVerified: true,
          isAdmin: false,
          alumniId: null,
        },
      },
    })

    const mockProfiles = [
      {
        id: { getValue: () => "profile-2" },
        name: "홍길동",
        graduationClass: { getValue: () => 6 },
        email: { getValue: () => "hong@example.com" },
        isVerified: true,
        alumniId: "alumni-1",
        toPrimitives: () => ({
          id: "profile-2",
          name: "홍길동",
          graduationClass: 6,
          email: "hong@example.com",
          isVerified: true,
          isAdmin: false,
          alumniId: "alumni-1",
          createdAt: new Date(),
        }),
      },
    ]

    mockProfileRepository.findAll.mockResolvedValue({
      items: mockProfiles,
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    })

    const request = createMockRequest()
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.data.isVerified).toBe(true)

    // Verified users should see full data
    const profile = data.data.profiles[0]
    expect(profile.id).toBe("profile-2")
    expect(profile.name).toBe("홍길동")
    expect(profile.graduationClass).toBe(6)
    expect(profile.email).toBe("hong@example.com")
    expect(profile.alumniId).toBe("alumni-1")
  })

  it("should apply search filters", async () => {
    mockRequireAuth.mockResolvedValue({
      success: true,
      auth: {
        user: { id: "user-1", email: "test@example.com" },
        profile: {
          id: "profile-1",
          email: "test@example.com",
          name: "테스트",
          graduationClass: 5,
          isVerified: true,
          isAdmin: false,
          alumniId: null,
        },
      },
    })

    mockProfileRepository.findAll.mockResolvedValue({
      items: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    })

    const request = createMockRequest({
      q: "홍길동",
      graduationClass: "6",
    })

    await GET(request)

    expect(mockProfileRepository.findAll).toHaveBeenCalledWith(
      {
        name: "홍길동",
        graduationClass: 6,
        excludeProfileId: "profile-1",
      },
      { page: 1, limit: 20 }
    )
  })

  it("should support pagination", async () => {
    mockRequireAuth.mockResolvedValue({
      success: true,
      auth: {
        user: { id: "user-1", email: "test@example.com" },
        profile: {
          id: "profile-1",
          email: "test@example.com",
          name: "테스트",
          graduationClass: 5,
          isVerified: true,
          isAdmin: false,
          alumniId: null,
        },
      },
    })

    mockProfileRepository.findAll.mockResolvedValue({
      items: [],
      total: 50,
      page: 2,
      limit: 10,
      totalPages: 5,
    })

    const request = createMockRequest({
      page: "2",
      limit: "10",
    })

    const response = await GET(request)
    const data = await response.json()

    expect(mockProfileRepository.findAll).toHaveBeenCalledWith(
      { excludeProfileId: "profile-1" },
      { page: 2, limit: 10 }
    )

    expect(data.data.pagination.page).toBe(2)
    expect(data.data.pagination.limit).toBe(10)
    expect(data.data.pagination.totalPages).toBe(5)
  })

  it("should exclude current user from results", async () => {
    mockRequireAuth.mockResolvedValue({
      success: true,
      auth: {
        user: { id: "user-1", email: "test@example.com" },
        profile: {
          id: "profile-1",
          email: "test@example.com",
          name: "테스트",
          graduationClass: 5,
          isVerified: true,
          isAdmin: false,
          alumniId: null,
        },
      },
    })

    mockProfileRepository.findAll.mockResolvedValue({
      items: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    })

    const request = createMockRequest()
    await GET(request)

    const callArgs = mockProfileRepository.findAll.mock.calls[0]
    expect(callArgs[0]).toHaveProperty("excludeProfileId", "profile-1")
  })

  it("should handle server errors", async () => {
    mockRequireAuth.mockResolvedValue({
      success: true,
      auth: {
        user: { id: "user-1", email: "test@example.com" },
        profile: {
          id: "profile-1",
          email: "test@example.com",
          name: "테스트",
          graduationClass: 5,
          isVerified: true,
          isAdmin: false,
          alumniId: null,
        },
      },
    })

    mockProfileRepository.findAll.mockRejectedValue(new Error("Database error"))

    const request = createMockRequest()
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.success).toBe(false)
    expect(data.message).toBe("Failed to fetch alumni directory.")
  })
})
