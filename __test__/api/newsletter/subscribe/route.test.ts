import { describe, it, expect, beforeEach, vi } from "vitest"
import { POST } from "@/app/api/newsletter/subscribe/route"
import { NextRequest } from "next/server"
import { Subscription } from "@/domain/subscription/entities/Subscription"

// Mock the container
vi.mock("@/infrastructure/di/container", () => ({
  container: {
    getSubscriptionRepository: vi.fn(),
  },
}))

import { container } from "@/infrastructure/di/container"

describe("/api/newsletter/subscribe - POST", () => {
  const mockSubscriptionRepository = {
    findByEmail: vi.fn(),
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

  const createMockRequest = (body: Record<string, unknown>) => {
    return new NextRequest("http://localhost:3000/api/newsletter/subscribe", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })
  }

  it("should subscribe new email successfully", async () => {
    mockSubscriptionRepository.findByEmail.mockResolvedValue(null)
    mockSubscriptionRepository.save.mockResolvedValue(undefined)

    const request = createMockRequest({ email: "test@example.com" })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.message).toBe("Successfully subscribed to newsletter")
    expect(mockSubscriptionRepository.findByEmail).toHaveBeenCalledWith(
      "test@example.com"
    )
    expect(mockSubscriptionRepository.save).toHaveBeenCalledTimes(1)
  })

  it("should return success message if already subscribed and active", async () => {
    const existingSubscription = Subscription.create("test@example.com")
    mockSubscriptionRepository.findByEmail.mockResolvedValue(
      existingSubscription
    )

    const request = createMockRequest({ email: "test@example.com" })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.message).toBe("You are already subscribed to our newsletter")
    expect(mockSubscriptionRepository.save).not.toHaveBeenCalled()
  })

  it("should resubscribe if previously unsubscribed", async () => {
    const existingSubscription = Subscription.create("test@example.com")
    existingSubscription.unsubscribe()
    mockSubscriptionRepository.findByEmail.mockResolvedValue(
      existingSubscription
    )
    mockSubscriptionRepository.save.mockResolvedValue(undefined)

    const request = createMockRequest({ email: "test@example.com" })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.message).toBe("Successfully resubscribed to newsletter")
    expect(existingSubscription.isActive).toBe(true)
    expect(mockSubscriptionRepository.save).toHaveBeenCalledTimes(1)
  })

  it("should return error when email is missing", async () => {
    const request = createMockRequest({})
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe("Email is required")
    expect(mockSubscriptionRepository.findByEmail).not.toHaveBeenCalled()
  })

  it("should return error when email is invalid", async () => {
    const request = createMockRequest({ email: "invalid-email" })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe("Invalid email format")
    expect(mockSubscriptionRepository.findByEmail).not.toHaveBeenCalled()
  })

  it("should return error when email is not a string", async () => {
    const request = createMockRequest({ email: 123 })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe("Email is required")
  })

  it("should handle server errors", async () => {
    mockSubscriptionRepository.findByEmail.mockRejectedValue(
      new Error("Database error")
    )

    const request = createMockRequest({ email: "test@example.com" })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe("Failed to subscribe to newsletter")
  })
})
