import { describe, it, expect, vi, beforeEach } from "vitest"
import { GET, POST } from "@/app/api/announcements/route"
import { NextRequest, NextResponse } from "next/server"

vi.mock("@/infrastructure/auth/middleware", () => ({
  requireAuth: vi.fn(),
  requireVerified: vi.fn(),
  requireProfile: vi.fn(),
  requireAdmin: vi.fn(),
  getAuthUser: vi.fn(),
}))

vi.mock("@/infrastructure/di/container", () => ({
  container: {
    getAnnouncementRepository: vi.fn(),
  },
}))

import { requireAuth, requireVerified } from "@/infrastructure/auth/middleware"
import { container } from "@/infrastructure/di/container"

const mockProfile = {
  id: "profile-id",
  email: "user@test.com",
  name: "Test User",
  graduationClass: 2020,
  isVerified: true,
  isAdmin: false,
  alumniId: null,
}

const makeVerifiedAuth = () => ({
  success: true as const,
  auth: {
    user: { id: "user-id", email: "user@test.com" },
    profile: mockProfile,
  },
})

const makeBasicAuth = (profile = mockProfile) => ({
  success: true as const,
  auth: {
    user: { id: "user-id", email: "user@test.com" },
    profile,
  },
})

const makeAuthFail = (status: number, message: string) => ({
  success: false as const,
  response: NextResponse.json({ success: false, message }, { status }),
})

const makeMockAnnouncement = (overrides = {}) => ({
  id: "ann-id",
  authorId: "profile-id",
  type: "member_announcements",
  title: "Test Announcement",
  content: "Test content",
  status: "pending",
  toPrimitives: vi.fn().mockReturnValue({
    id: "ann-id",
    authorId: "profile-id",
    type: "member_announcements",
    title: "Test Announcement",
    content: "Test content",
    status: "pending",
    reviewedBy: null,
    reviewedAt: null,
    rejectionReason: null,
    createdAt: new Date().toISOString(),
  }),
  ...overrides,
})

describe("/api/announcements POST", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("should return 401 if not authenticated", async () => {
    vi.mocked(requireVerified).mockResolvedValue(
      makeAuthFail(401, "로그인이 필요합니다.")
    )

    const request = new NextRequest("http://localhost/api/announcements", {
      method: "POST",
      body: JSON.stringify({
        type: "member_announcements",
        title: "Test",
        content: "Content",
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.success).toBe(false)
  })

  it("should return 403 if not verified", async () => {
    vi.mocked(requireVerified).mockResolvedValue(
      makeAuthFail(403, "인증된 동문만 이용 가능합니다.")
    )

    const request = new NextRequest("http://localhost/api/announcements", {
      method: "POST",
      body: JSON.stringify({
        type: "member_announcements",
        title: "Test",
        content: "Content",
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(403)
    expect(data.success).toBe(false)
  })

  it("should return 400 if required fields are missing", async () => {
    vi.mocked(requireVerified).mockResolvedValue(makeVerifiedAuth())

    const request = new NextRequest("http://localhost/api/announcements", {
      method: "POST",
      body: JSON.stringify({ title: "Test" }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
    expect(data.message).toBe("Type, title, and content are required.")
  })

  it("should return 400 if type is invalid", async () => {
    vi.mocked(requireVerified).mockResolvedValue(makeVerifiedAuth())

    const request = new NextRequest("http://localhost/api/announcements", {
      method: "POST",
      body: JSON.stringify({
        type: "invalid_type",
        title: "Test",
        content: "Content",
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
    expect(data.message).toContain("Invalid announcement type")
  })

  it("should create announcement and return 200", async () => {
    vi.mocked(requireVerified).mockResolvedValue(makeVerifiedAuth())

    const mockAnnouncementRepo = {
      save: vi.fn().mockResolvedValue(undefined),
    }
    vi.mocked(container.getAnnouncementRepository).mockReturnValue(
      mockAnnouncementRepo as never
    )

    const request = new NextRequest("http://localhost/api/announcements", {
      method: "POST",
      body: JSON.stringify({
        type: "member_announcements",
        title: "Test Announcement",
        content: "Test content",
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.data).toBeDefined()
    expect(mockAnnouncementRepo.save).toHaveBeenCalled()
  })

  it("should accept all valid announcement types", async () => {
    const validTypes = [
      "alumni_in_media",
      "member_announcements",
      "industry_trends",
    ]

    for (const type of validTypes) {
      vi.clearAllMocks()
      vi.mocked(requireVerified).mockResolvedValue(makeVerifiedAuth())

      const mockAnnouncementRepo = {
        save: vi.fn().mockResolvedValue(undefined),
      }
      vi.mocked(container.getAnnouncementRepository).mockReturnValue(
        mockAnnouncementRepo as never
      )

      const request = new NextRequest("http://localhost/api/announcements", {
        method: "POST",
        body: JSON.stringify({ type, title: "Test", content: "Content" }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
    }
  })

  it("should return 500 on repository error", async () => {
    vi.mocked(requireVerified).mockResolvedValue(makeVerifiedAuth())

    vi.mocked(container.getAnnouncementRepository).mockImplementation(() => {
      throw new Error("DB error")
    })

    const request = new NextRequest("http://localhost/api/announcements", {
      method: "POST",
      body: JSON.stringify({
        type: "member_announcements",
        title: "Test",
        content: "Content",
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.success).toBe(false)
  })
})

describe("/api/announcements GET", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("should return 401 if not authenticated", async () => {
    vi.mocked(requireAuth).mockResolvedValue(
      makeAuthFail(401, "로그인이 필요합니다.")
    )

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.success).toBe(false)
  })

  it("should return 404 if profile not found", async () => {
    vi.mocked(requireAuth).mockResolvedValue({
      success: true as const,
      auth: {
        user: { id: "user-id", email: "user@test.com" },
        profile: null,
      },
    } as never)

    const mockAnnouncementRepo = {
      findByAuthorId: vi.fn().mockResolvedValue([]),
    }
    vi.mocked(container.getAnnouncementRepository).mockReturnValue(
      mockAnnouncementRepo as never
    )

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data.success).toBe(false)
    expect(data.message).toBe("Profile not found.")
  })

  it("should return announcements for authenticated user", async () => {
    vi.mocked(requireAuth).mockResolvedValue(makeBasicAuth())

    const mockAnn = makeMockAnnouncement()
    const mockAnnouncementRepo = {
      findByAuthorId: vi.fn().mockResolvedValue([mockAnn]),
    }
    vi.mocked(container.getAnnouncementRepository).mockReturnValue(
      mockAnnouncementRepo as never
    )

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.data).toHaveLength(1)
    expect(mockAnnouncementRepo.findByAuthorId).toHaveBeenCalledWith(
      "profile-id"
    )
  })

  it("should return empty array when no announcements", async () => {
    vi.mocked(requireAuth).mockResolvedValue(makeBasicAuth())

    const mockAnnouncementRepo = {
      findByAuthorId: vi.fn().mockResolvedValue([]),
    }
    vi.mocked(container.getAnnouncementRepository).mockReturnValue(
      mockAnnouncementRepo as never
    )

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.data).toHaveLength(0)
  })

  it("should return 500 on repository error", async () => {
    vi.mocked(requireAuth).mockResolvedValue(makeBasicAuth())

    vi.mocked(container.getAnnouncementRepository).mockImplementation(() => {
      throw new Error("DB error")
    })

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.success).toBe(false)
  })
})
