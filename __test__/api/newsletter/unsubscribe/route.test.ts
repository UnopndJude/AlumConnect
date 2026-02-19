import { describe, it, expect, beforeEach, vi } from "vitest"
import { GET } from "@/app/api/newsletter/unsubscribe/route"
import { NextRequest } from "next/server"
import { Subscription } from "@/domain/subscription/entities/Subscription"

// Mock the container
vi.mock("@/infrastructure/di/container", () => ({
  container: {
    getSubscriptionRepository: vi.fn(),
  },
}))

import { container } from "@/infrastructure/di/container"

describe("/api/newsletter/unsubscribe - GET", () => {
  const mockSubscriptionRepository = {
    findByUnsubscribeToken: vi.fn(),
    save: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(container.getSubscriptionRepository).mockReturnValue(
      mockSubscriptionRepository as unknown as ReturnType<
        typeof container.getSubscriptionRepository
      >
    )
  })

  const createMockRequest = (token?: string) => {
    const url = token
      ? `http://localhost:3000/api/newsletter/unsubscribe?token=${token}`
      : "http://localhost:3000/api/newsletter/unsubscribe"
    return new NextRequest(url, {
      method: "GET",
    })
  }

  it("should unsubscribe successfully with valid token", async () => {
    const subscription = Subscription.create("test@example.com")
    const token = subscription.unsubscribeToken

    mockSubscriptionRepository.findByUnsubscribeToken.mockResolvedValue(
      subscription
    )
    mockSubscriptionRepository.save.mockResolvedValue(undefined)

    const request = createMockRequest(token)
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.message).toBe("Successfully unsubscribed from newsletter")
    expect(subscription.isActive).toBe(false)
    expect(mockSubscriptionRepository.save).toHaveBeenCalledTimes(1)
  })

  it("should return message if already unsubscribed", async () => {
    const subscription = Subscription.create("test@example.com")
    subscription.unsubscribe()
    const token = subscription.unsubscribeToken

    mockSubscriptionRepository.findByUnsubscribeToken.mockResolvedValue(
      subscription
    )

    const request = createMockRequest(token)
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.message).toBe(
      "You are already unsubscribed from the newsletter"
    )
    expect(mockSubscriptionRepository.save).not.toHaveBeenCalled()
  })

  it("should return error when token is missing", async () => {
    const request = createMockRequest()
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
    expect(data.message).toBe("Unsubscribe token is required")
    expect(
      mockSubscriptionRepository.findByUnsubscribeToken
    ).not.toHaveBeenCalled()
  })

  it("should return error when token is invalid", async () => {
    const invalidToken = "invalid-token-123"
    mockSubscriptionRepository.findByUnsubscribeToken.mockResolvedValue(null)

    const request = createMockRequest(invalidToken)
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data.success).toBe(false)
    expect(data.message).toBe("Invalid or expired unsubscribe link")
    expect(mockSubscriptionRepository.save).not.toHaveBeenCalled()
  })

  it("should handle server errors", async () => {
    mockSubscriptionRepository.findByUnsubscribeToken.mockRejectedValue(
      new Error("Database error")
    )

    const request = createMockRequest("some-token")
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.success).toBe(false)
    expect(data.message).toBe("Failed to unsubscribe from newsletter")
  })
})
