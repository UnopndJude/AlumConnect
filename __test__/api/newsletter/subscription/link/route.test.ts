import { describe, it, expect, beforeEach, vi } from "vitest"
import { POST } from "@/app/api/newsletter/subscription/link/route"
import { Subscription } from "@/domain/subscription/entities/Subscription"

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

describe("/api/newsletter/subscription/link - POST", () => {
  const mockSubscriptionRepository = {
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

  it("should link subscription to user account successfully", async () => {
    const subscription = Subscription.create("test@example.com")
    mockSubscriptionRepository.findByEmail.mockResolvedValue(subscription)
    mockSubscriptionRepository.save.mockResolvedValue(undefined)
    vi.mocked(requireAuth).mockResolvedValue({
      success: true,
      auth: mockAuth,
    })

    const response = await POST()
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.message).toBe("구독이 계정과 연결되었습니다.")
    expect(data.subscription.userId).toBe("user-123")
    expect(mockSubscriptionRepository.findByEmail).toHaveBeenCalledWith(
      "test@example.com"
    )
    expect(mockSubscriptionRepository.save).toHaveBeenCalledTimes(1)
    expect(subscription.userId).toBe("user-123")
  })

  it("should return message if subscription already linked", async () => {
    const subscription = Subscription.create("test@example.com", "user-123")
    mockSubscriptionRepository.findByEmail.mockResolvedValue(subscription)
    vi.mocked(requireAuth).mockResolvedValue({
      success: true,
      auth: mockAuth,
    })

    const response = await POST()
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.message).toBe("이미 계정과 연결되어 있습니다.")
    expect(mockSubscriptionRepository.save).not.toHaveBeenCalled()
  })

  it("should return 404 when subscription not found", async () => {
    mockSubscriptionRepository.findByEmail.mockResolvedValue(null)
    vi.mocked(requireAuth).mockResolvedValue({
      success: true,
      auth: mockAuth,
    })

    const response = await POST()
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data.success).toBe(false)
    expect(data.message).toBe("구독 정보를 찾을 수 없습니다.")
    expect(mockSubscriptionRepository.save).not.toHaveBeenCalled()
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

    const response = await POST()
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.success).toBe(false)
    expect(data.message).toBe("로그인이 필요합니다.")
    expect(mockSubscriptionRepository.findByEmail).not.toHaveBeenCalled()
  })

  it("should handle server errors", async () => {
    mockSubscriptionRepository.findByEmail.mockRejectedValue(
      new Error("Database error")
    )
    vi.mocked(requireAuth).mockResolvedValue({
      success: true,
      auth: mockAuth,
    })

    const response = await POST()
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.success).toBe(false)
    expect(data.message).toBe("구독 연결에 실패했습니다.")
  })
})
