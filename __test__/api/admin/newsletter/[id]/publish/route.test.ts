import { describe, it, expect, beforeEach, vi } from "vitest"
import { POST } from "@/app/api/admin/newsletter/[id]/publish/route"
import { NextRequest } from "next/server"
import { Newsletter } from "@/domain/newsletter/entities/Newsletter"
import { NewsletterSection } from "@/domain/newsletter/entities/NewsletterSection"

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

describe("POST /api/admin/newsletter/[id]/publish", () => {
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

  it("should publish a newsletter", async () => {
    const newsletter = Newsletter.create({
      edition: 1,
      title: "Test Newsletter",
      sections: [
        NewsletterSection.create({
          type: "alumni_in_media",
          title: "Section 1",
          content: "Content 1",
          order: 0,
        }),
      ],
    })

    const mockRepo = {
      findById: vi.fn().mockResolvedValue(newsletter),
      save: vi.fn().mockResolvedValue(undefined),
    }

    vi.mocked(container.getNewsletterRepository).mockReturnValue(
      mockRepo as any
    )

    const request = new NextRequest(
      "http://localhost:3000/api/admin/newsletter/test-id/publish",
      { method: "POST" }
    )

    const response = await POST(request, {
      params: Promise.resolve({ id: "test-id" }),
    })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.data.status).toBe("published")
    expect(data.data.publishedAt).toBeDefined()
    expect(mockRepo.save).toHaveBeenCalledOnce()
  })

  it("should reject publishing newsletter without sections", async () => {
    const newsletter = Newsletter.create({
      edition: 1,
      title: "Test Newsletter",
      sections: [],
    })

    const mockRepo = {
      findById: vi.fn().mockResolvedValue(newsletter),
    }

    vi.mocked(container.getNewsletterRepository).mockReturnValue(
      mockRepo as any
    )

    const request = new NextRequest(
      "http://localhost:3000/api/admin/newsletter/test-id/publish",
      { method: "POST" }
    )

    const response = await POST(request, {
      params: Promise.resolve({ id: "test-id" }),
    })
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
    expect(data.message).toContain("최소 하나의 섹션이 필요합니다")
  })

  it("should reject publishing already published newsletter", async () => {
    const newsletter = Newsletter.create({
      edition: 1,
      title: "Test Newsletter",
      sections: [
        NewsletterSection.create({
          type: "alumni_in_media",
          title: "Section 1",
          content: "Content 1",
          order: 0,
        }),
      ],
    })

    // Publish it first
    newsletter.publish()

    const mockRepo = {
      findById: vi.fn().mockResolvedValue(newsletter),
    }

    vi.mocked(container.getNewsletterRepository).mockReturnValue(
      mockRepo as any
    )

    const request = new NextRequest(
      "http://localhost:3000/api/admin/newsletter/test-id/publish",
      { method: "POST" }
    )

    const response = await POST(request, {
      params: Promise.resolve({ id: "test-id" }),
    })
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
    expect(data.message).toContain("이미 발행된 뉴스레터입니다")
  })

  it("should return 404 for non-existent newsletter", async () => {
    const mockRepo = {
      findById: vi.fn().mockResolvedValue(null),
    }

    vi.mocked(container.getNewsletterRepository).mockReturnValue(
      mockRepo as any
    )

    const request = new NextRequest(
      "http://localhost:3000/api/admin/newsletter/test-id/publish",
      { method: "POST" }
    )

    const response = await POST(request, {
      params: Promise.resolve({ id: "test-id" }),
    })
    const data = await response.json()

    expect(response.status).toBe(404)
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
      "http://localhost:3000/api/admin/newsletter/test-id/publish",
      { method: "POST" }
    )

    const response = await POST(request, {
      params: Promise.resolve({ id: "test-id" }),
    })
    const data = await response.json()

    expect(response.status).toBe(403)
    expect(data.message).toContain("관리자 권한이 필요합니다")
  })
})
