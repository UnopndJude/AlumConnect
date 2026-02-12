import { describe, it, expect, beforeEach, vi } from "vitest"
import { POST } from "@/app/api/admin/newsletter/[id]/distribute/route"
import { NextRequest } from "next/server"
import { Newsletter } from "@/domain/newsletter/entities/Newsletter"
import { NewsletterSection } from "@/domain/newsletter/entities/NewsletterSection"
import { Subscription } from "@/domain/subscription/entities/Subscription"

vi.mock("@/infrastructure/di/container", () => ({
  container: {
    getNewsletterRepository: vi.fn(),
    getSubscriptionRepository: vi.fn(),
    getEmailService: vi.fn(),
  },
}))

vi.mock("@/infrastructure/auth/middleware", () => ({
  requireAdmin: vi.fn(),
}))

import { container } from "@/infrastructure/di/container"
import { requireAdmin } from "@/infrastructure/auth/middleware"

describe("POST /api/admin/newsletter/[id]/distribute", () => {
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

  it("should distribute newsletter to all active subscribers", async () => {
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
    newsletter.publish()

    const subscribers = [
      Subscription.create("user1@example.com", "user-1"),
      Subscription.create("user2@example.com", "user-2"),
      Subscription.create("user3@example.com", null),
    ]

    const mockNewsletterRepo = {
      findById: vi.fn().mockResolvedValue(newsletter),
    }

    const mockSubscriptionRepo = {
      findAllActive: vi.fn().mockResolvedValue(subscribers),
    }

    const mockEmailService = {
      sendBatch: vi.fn().mockResolvedValue({
        success: true,
        sent: 3,
        failed: 0,
      }),
    }

    vi.mocked(container.getNewsletterRepository).mockReturnValue(
      mockNewsletterRepo as any
    )
    vi.mocked(container.getSubscriptionRepository).mockReturnValue(
      mockSubscriptionRepo as any
    )
    vi.mocked(container.getEmailService).mockReturnValue(
      mockEmailService as any
    )

    const request = new NextRequest(
      "http://localhost:3000/api/admin/newsletter/test-id/distribute",
      { method: "POST" }
    )

    const response = await POST(request, {
      params: Promise.resolve({ id: "test-id" }),
    })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.sent).toBe(3)
    expect(data.failed).toBe(0)

    expect(mockNewsletterRepo.findById).toHaveBeenCalledWith("test-id")
    expect(mockSubscriptionRepo.findAllActive).toHaveBeenCalledOnce()
    expect(mockEmailService.sendBatch).toHaveBeenCalledOnce()

    const emailMessages = mockEmailService.sendBatch.mock.calls[0][0]
    expect(emailMessages).toHaveLength(3)
    expect(emailMessages[0].to.email).toBe("user1@example.com")
    expect(emailMessages[0].subject).toContain("AlumConnect Newsletter")
    expect(emailMessages[0].subject).toContain("제 1호")
    expect(emailMessages[0].html).toContain("Test Newsletter")
    expect(emailMessages[0].text).toContain("Test Newsletter")
    expect(emailMessages[0].html).toContain(
      `/api/newsletter/unsubscribe?token=${subscribers[0].unsubscribeToken}`
    )
    expect(emailMessages[0].text).toContain(
      `/api/newsletter/unsubscribe?token=${subscribers[0].unsubscribeToken}`
    )
  })

  it("should handle partial failures gracefully", async () => {
    const newsletter = Newsletter.create({
      edition: 2,
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
    newsletter.publish()

    const subscribers = [
      Subscription.create("user1@example.com", "user-1"),
      Subscription.create("user2@example.com", "user-2"),
      Subscription.create("user3@example.com", "user-3"),
    ]

    const mockNewsletterRepo = {
      findById: vi.fn().mockResolvedValue(newsletter),
    }

    const mockSubscriptionRepo = {
      findAllActive: vi.fn().mockResolvedValue(subscribers),
    }

    const mockEmailService = {
      sendBatch: vi.fn().mockResolvedValue({
        success: false,
        sent: 2,
        failed: 1,
      }),
    }

    vi.mocked(container.getNewsletterRepository).mockReturnValue(
      mockNewsletterRepo as any
    )
    vi.mocked(container.getSubscriptionRepository).mockReturnValue(
      mockSubscriptionRepo as any
    )
    vi.mocked(container.getEmailService).mockReturnValue(
      mockEmailService as any
    )

    const request = new NextRequest(
      "http://localhost:3000/api/admin/newsletter/test-id/distribute",
      { method: "POST" }
    )

    const response = await POST(request, {
      params: Promise.resolve({ id: "test-id" }),
    })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(false)
    expect(data.sent).toBe(2)
    expect(data.failed).toBe(1)
  })

  it("should return success with zero sends when no active subscribers", async () => {
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
    newsletter.publish()

    const mockNewsletterRepo = {
      findById: vi.fn().mockResolvedValue(newsletter),
    }

    const mockSubscriptionRepo = {
      findAllActive: vi.fn().mockResolvedValue([]),
    }

    vi.mocked(container.getNewsletterRepository).mockReturnValue(
      mockNewsletterRepo as any
    )
    vi.mocked(container.getSubscriptionRepository).mockReturnValue(
      mockSubscriptionRepo as any
    )

    const request = new NextRequest(
      "http://localhost:3000/api/admin/newsletter/test-id/distribute",
      { method: "POST" }
    )

    const response = await POST(request, {
      params: Promise.resolve({ id: "test-id" }),
    })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.sent).toBe(0)
    expect(data.failed).toBe(0)
    expect(data.message).toContain("활성 구독자가 없습니다")
  })

  it("should return 404 for non-existent newsletter", async () => {
    const mockNewsletterRepo = {
      findById: vi.fn().mockResolvedValue(null),
    }

    vi.mocked(container.getNewsletterRepository).mockReturnValue(
      mockNewsletterRepo as any
    )

    const request = new NextRequest(
      "http://localhost:3000/api/admin/newsletter/test-id/distribute",
      { method: "POST" }
    )

    const response = await POST(request, {
      params: Promise.resolve({ id: "test-id" }),
    })
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data.success).toBe(false)
    expect(data.message).toContain("뉴스레터를 찾을 수 없습니다")
  })

  it("should return 400 if newsletter is not published", async () => {
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
    // Not published

    const mockNewsletterRepo = {
      findById: vi.fn().mockResolvedValue(newsletter),
    }

    vi.mocked(container.getNewsletterRepository).mockReturnValue(
      mockNewsletterRepo as any
    )

    const request = new NextRequest(
      "http://localhost:3000/api/admin/newsletter/test-id/distribute",
      { method: "POST" }
    )

    const response = await POST(request, {
      params: Promise.resolve({ id: "test-id" }),
    })
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
    expect(data.message).toContain("발행된 뉴스레터만 배포할 수 있습니다")
  })

  it("should return 500 on email service errors", async () => {
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
    newsletter.publish()

    const subscribers = [Subscription.create("user1@example.com", "user-1")]

    const mockNewsletterRepo = {
      findById: vi.fn().mockResolvedValue(newsletter),
    }

    const mockSubscriptionRepo = {
      findAllActive: vi.fn().mockResolvedValue(subscribers),
    }

    const mockEmailService = {
      sendBatch: vi.fn().mockRejectedValue(new Error("Email service error")),
    }

    vi.mocked(container.getNewsletterRepository).mockReturnValue(
      mockNewsletterRepo as any
    )
    vi.mocked(container.getSubscriptionRepository).mockReturnValue(
      mockSubscriptionRepo as any
    )
    vi.mocked(container.getEmailService).mockReturnValue(
      mockEmailService as any
    )

    const request = new NextRequest(
      "http://localhost:3000/api/admin/newsletter/test-id/distribute",
      { method: "POST" }
    )

    const response = await POST(request, {
      params: Promise.resolve({ id: "test-id" }),
    })
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.success).toBe(false)
    expect(data.message).toContain("뉴스레터 배포에 실패했습니다")
    expect(data.error).toContain("Email service error")
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
      "http://localhost:3000/api/admin/newsletter/test-id/distribute",
      { method: "POST" }
    )

    const response = await POST(request, {
      params: Promise.resolve({ id: "test-id" }),
    })
    const data = await response.json()

    expect(response.status).toBe(403)
    expect(data.message).toContain("관리자 권한이 필요합니다")
  })

  it("should include correct unsubscribe tokens for each subscriber", async () => {
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
    newsletter.publish()

    const sub1 = Subscription.create("user1@example.com", "user-1")
    const sub2 = Subscription.create("user2@example.com", "user-2")
    const subscribers = [sub1, sub2]

    const mockNewsletterRepo = {
      findById: vi.fn().mockResolvedValue(newsletter),
    }

    const mockSubscriptionRepo = {
      findAllActive: vi.fn().mockResolvedValue(subscribers),
    }

    const mockEmailService = {
      sendBatch: vi.fn().mockResolvedValue({
        success: true,
        sent: 2,
        failed: 0,
      }),
    }

    vi.mocked(container.getNewsletterRepository).mockReturnValue(
      mockNewsletterRepo as any
    )
    vi.mocked(container.getSubscriptionRepository).mockReturnValue(
      mockSubscriptionRepo as any
    )
    vi.mocked(container.getEmailService).mockReturnValue(
      mockEmailService as any
    )

    const request = new NextRequest(
      "http://localhost:3000/api/admin/newsletter/test-id/distribute",
      { method: "POST" }
    )

    await POST(request, {
      params: Promise.resolve({ id: "test-id" }),
    })

    const emailMessages = mockEmailService.sendBatch.mock.calls[0][0]

    // Verify each subscriber gets their own unique token
    expect(emailMessages[0].html).toContain(sub1.unsubscribeToken)
    expect(emailMessages[0].html).not.toContain(sub2.unsubscribeToken)
    expect(emailMessages[0].text).toContain(sub1.unsubscribeToken)
    expect(emailMessages[0].text).not.toContain(sub2.unsubscribeToken)

    expect(emailMessages[1].html).toContain(sub2.unsubscribeToken)
    expect(emailMessages[1].html).not.toContain(sub1.unsubscribeToken)
    expect(emailMessages[1].text).toContain(sub2.unsubscribeToken)
    expect(emailMessages[1].text).not.toContain(sub1.unsubscribeToken)
  })
})
