import { describe, it, expect, beforeEach, vi } from "vitest"
import { POST, GET } from "@/app/api/admin/newsletter/route"
import { NextRequest } from "next/server"
import { Newsletter } from "@/domain/newsletter/entities/Newsletter"

vi.mock("@/infrastructure/di/container", () => ({
  container: {
    getNewsletterRepository: vi.fn(),
  },
}))

vi.mock("@/infrastructure/auth/middleware", () => ({
  requireAdmin: vi.fn(),
}))

import { container } from "@/infrastructure/di/container"
import { requireAdmin } from "@/infrastructure/auth/middleware"

describe("POST /api/admin/newsletter", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(requireAdmin).mockResolvedValue({
      success: true,
      auth: {
        user: { id: "admin-id", email: "admin@example.com" },
        profile: {
          id: "admin-id",
          email: "admin@example.com",
          name: "Admin",
          graduationClass: 2020,
          isVerified: true,
          isAdmin: true,
          alumniId: null,
        },
      },
    })
  })

  it("should create a new newsletter draft", async () => {
    const mockNewsletter = Newsletter.create({
      edition: 1,
      title: "Test Newsletter",
      sections: [],
    })

    const mockRepo = {
      getNextEditionNumber: vi.fn().mockResolvedValue(1),
      save: vi.fn().mockResolvedValue(undefined),
    }

    vi.mocked(container.getNewsletterRepository).mockReturnValue(
      mockRepo as any
    )

    const request = new NextRequest(
      "http://localhost:3000/api/admin/newsletter",
      {
        method: "POST",
        body: JSON.stringify({ title: "Test Newsletter" }),
      }
    )

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.data.title).toBe("Test Newsletter")
    expect(data.data.edition).toBe(1)
    expect(data.data.status).toBe("draft")
    expect(mockRepo.getNextEditionNumber).toHaveBeenCalledOnce()
    expect(mockRepo.save).toHaveBeenCalledOnce()
  })

  it("should reject empty title", async () => {
    const request = new NextRequest(
      "http://localhost:3000/api/admin/newsletter",
      {
        method: "POST",
        body: JSON.stringify({ title: "" }),
      }
    )

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
    expect(data.message).toContain("제목은 필수입니다")
  })

  it("should reject missing title", async () => {
    const request = new NextRequest(
      "http://localhost:3000/api/admin/newsletter",
      {
        method: "POST",
        body: JSON.stringify({}),
      }
    )

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
  })

  it("should require admin auth", async () => {
    vi.mocked(requireAdmin).mockResolvedValue({
      success: false,
      response: Response.json(
        { success: false, message: "관리자 권한이 필요합니다." },
        { status: 403 }
      ) as any,
    })

    const request = new NextRequest(
      "http://localhost:3000/api/admin/newsletter",
      {
        method: "POST",
        body: JSON.stringify({ title: "Test" }),
      }
    )

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(403)
    expect(data.message).toContain("관리자 권한이 필요합니다")
  })
})

describe("GET /api/admin/newsletter", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(requireAdmin).mockResolvedValue({
      success: true,
      auth: {
        user: { id: "admin-id", email: "admin@example.com" },
        profile: {
          id: "admin-id",
          email: "admin@example.com",
          name: "Admin",
          graduationClass: 2020,
          isVerified: true,
          isAdmin: true,
          alumniId: null,
        },
      },
    })
  })

  it("should list all newsletters", async () => {
    const newsletter1 = Newsletter.create({
      edition: 2,
      title: "Newsletter 2",
      sections: [],
    })
    const newsletter2 = Newsletter.create({
      edition: 1,
      title: "Newsletter 1",
      sections: [],
    })

    const mockRepo = {
      findAll: vi.fn().mockResolvedValue([newsletter1, newsletter2]),
    }

    vi.mocked(container.getNewsletterRepository).mockReturnValue(
      mockRepo as any
    )

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.data).toHaveLength(2)
    expect(data.data[0].edition).toBe(2)
    expect(data.data[1].edition).toBe(1)
  })

  it("should require admin auth", async () => {
    vi.mocked(requireAdmin).mockResolvedValue({
      success: false,
      response: Response.json(
        { success: false, message: "관리자 권한이 필요합니다." },
        { status: 403 }
      ) as any,
    })

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(403)
    expect(data.message).toContain("관리자 권한이 필요합니다")
  })
})
