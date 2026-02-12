import { describe, it, expect, beforeEach, vi } from "vitest"
import { GET, PATCH } from "@/app/api/newsletter/subscription/preferences/route"
import { Subscription } from "@/domain/subscription/entities/Subscription"
import { NextRequest } from "next/server"

// Mock the auth middleware
vi.mock("@/infrastructure/auth/middleware", () => ({
  requireAuth: vi.fn(),
}))

// Mock the container
vi.mock("@/infrastructure/di/container", () => ({
  container: {
    getSubscriptionRepository: vi.fn(),
  },
}))

import { requireAuth } from "@/infrastructure/auth/middleware"
import { container } from "@/infrastructure/di/container"
import { NextResponse } from "next/server"

describe("/api/newsletter/subscription/preferences", () => {
  const mockSubscriptionRepository = {
    findByUserId: vi.fn(),
    findByEmail: vi.fn(),
    save: vi.fn(),
  }

  const mockAuth = {
    user: { id: "user-123", email: "test@example.com" },
    profile: null,
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(container.getSubscriptionRepository).mockReturnValue(
      mockSubscriptionRepository as unknown as ReturnType<
        typeof container.getSubscriptionRepository
      >
    )
  })

  describe("GET", () => {
    it("should return preferences when subscription found", async () => {
      const subscription = Subscription.create("test@example.com", "user-123")
      mockSubscriptionRepository.findByUserId.mockResolvedValue(subscription)
      vi.mocked(requireAuth).mockResolvedValue({
        success: true,
        auth: mockAuth,
      })

      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.preferences).toBeDefined()
      expect(data.preferences.optOutFromScraping).toBe(false)
      expect(Array.isArray(data.preferences.contentPreferences)).toBe(true)
    })

    it("should return 404 when subscription not found", async () => {
      mockSubscriptionRepository.findByUserId.mockResolvedValue(null)
      mockSubscriptionRepository.findByEmail.mockResolvedValue(null)
      vi.mocked(requireAuth).mockResolvedValue({
        success: true,
        auth: mockAuth,
      })

      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.success).toBe(false)
      expect(data.message).toBe("구독 정보를 찾을 수 없습니다.")
    })

    it("should return 401 when user not authenticated", async () => {
      const unauthorizedResponse = NextResponse.json(
        { success: false, message: "로그인이 필요합니다." },
        { status: 401 }
      )
      vi.mocked(requireAuth).mockResolvedValue({
        success: false,
        response: unauthorizedResponse,
      })

      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.success).toBe(false)
      expect(data.message).toBe("로그인이 필요합니다.")
    })

    it("should handle server errors", async () => {
      mockSubscriptionRepository.findByUserId.mockRejectedValue(
        new Error("Database error")
      )
      vi.mocked(requireAuth).mockResolvedValue({
        success: true,
        auth: mockAuth,
      })

      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
      expect(data.message).toBe("설정 조회에 실패했습니다.")
    })
  })

  describe("PATCH", () => {
    const createMockRequest = (body: Record<string, unknown>) => {
      return new NextRequest(
        "http://localhost:3000/api/newsletter/subscription/preferences",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        }
      )
    }

    it("should update preferences successfully", async () => {
      const subscription = Subscription.create("test@example.com", "user-123")
      mockSubscriptionRepository.findByUserId.mockResolvedValue(subscription)
      mockSubscriptionRepository.save.mockResolvedValue(undefined)
      vi.mocked(requireAuth).mockResolvedValue({
        success: true,
        auth: mockAuth,
      })

      const request = createMockRequest({
        optOutFromScraping: true,
        contentPreferences: ["alumni_in_media"],
      })

      const response = await PATCH(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.message).toBe("설정이 업데이트되었습니다.")
      expect(data.preferences.optOutFromScraping).toBe(true)
      expect(data.preferences.contentPreferences).toEqual(["alumni_in_media"])
      expect(mockSubscriptionRepository.save).toHaveBeenCalledTimes(1)
    })

    it("should update partial preferences", async () => {
      const subscription = Subscription.create("test@example.com", "user-123")
      mockSubscriptionRepository.findByUserId.mockResolvedValue(subscription)
      mockSubscriptionRepository.save.mockResolvedValue(undefined)
      vi.mocked(requireAuth).mockResolvedValue({
        success: true,
        auth: mockAuth,
      })

      const request = createMockRequest({
        optOutFromScraping: true,
      })

      const response = await PATCH(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.preferences.optOutFromScraping).toBe(true)
      expect(data.preferences.contentPreferences).toBeDefined()
    })

    it("should return 400 when preferences is missing", async () => {
      vi.mocked(requireAuth).mockResolvedValue({
        success: true,
        auth: mockAuth,
      })

      const request = new NextRequest(
        "http://localhost:3000/api/newsletter/subscription/preferences",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(null),
        }
      )
      const response = await PATCH(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.message).toBe("유효한 설정 정보가 필요합니다.")
    })

    it("should return 400 when optOutFromScraping is not boolean", async () => {
      vi.mocked(requireAuth).mockResolvedValue({
        success: true,
        auth: mockAuth,
      })

      const request = createMockRequest({
        optOutFromScraping: "true",
      })
      const response = await PATCH(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.message).toBe(
        "optOutFromScraping은 boolean 타입이어야 합니다."
      )
    })

    it("should return 400 when contentPreferences is not array", async () => {
      vi.mocked(requireAuth).mockResolvedValue({
        success: true,
        auth: mockAuth,
      })

      const request = createMockRequest({
        contentPreferences: "not-an-array",
      })
      const response = await PATCH(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.message).toBe("contentPreferences는 배열이어야 합니다.")
    })

    it("should return 400 when contentPreferences contains non-string", async () => {
      vi.mocked(requireAuth).mockResolvedValue({
        success: true,
        auth: mockAuth,
      })

      const request = createMockRequest({
        contentPreferences: ["valid", 123, "also-valid"],
      })
      const response = await PATCH(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.message).toBe(
        "contentPreferences의 모든 항목은 문자열이어야 합니다."
      )
    })

    it("should return 404 when subscription not found", async () => {
      mockSubscriptionRepository.findByUserId.mockResolvedValue(null)
      mockSubscriptionRepository.findByEmail.mockResolvedValue(null)
      vi.mocked(requireAuth).mockResolvedValue({
        success: true,
        auth: mockAuth,
      })

      const request = createMockRequest({
        optOutFromScraping: true,
      })
      const response = await PATCH(request)
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.success).toBe(false)
      expect(data.message).toBe("구독 정보를 찾을 수 없습니다.")
    })

    it("should return 401 when user not authenticated", async () => {
      const unauthorizedResponse = NextResponse.json(
        { success: false, message: "로그인이 필요합니다." },
        { status: 401 }
      )
      vi.mocked(requireAuth).mockResolvedValue({
        success: false,
        response: unauthorizedResponse,
      })

      const request = createMockRequest({
        optOutFromScraping: true,
      })
      const response = await PATCH(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.success).toBe(false)
      expect(data.message).toBe("로그인이 필요합니다.")
    })

    it("should handle server errors", async () => {
      mockSubscriptionRepository.findByUserId.mockRejectedValue(
        new Error("Database error")
      )
      vi.mocked(requireAuth).mockResolvedValue({
        success: true,
        auth: mockAuth,
      })

      const request = createMockRequest({
        optOutFromScraping: true,
      })
      const response = await PATCH(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
      expect(data.message).toBe("설정 업데이트에 실패했습니다.")
    })
  })
})
