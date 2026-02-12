import { describe, it, expect } from "vitest"
import { Subscription } from "@/domain/subscription/entities/Subscription"

describe("Subscription Entity", () => {
  describe("create", () => {
    it("should create a new subscription with all required fields", () => {
      const email = "test@example.com"
      const subscription = Subscription.create(email)

      expect(subscription.id).toBeDefined()
      expect(subscription.email).toBe(email)
      expect(subscription.userId).toBeNull()
      expect(subscription.status).toBe("active")
      expect(subscription.isActive).toBe(true)
      expect(subscription.subscribedAt).toBeInstanceOf(Date)
      expect(subscription.unsubscribedAt).toBeNull()
      expect(subscription.unsubscribeToken).toBeDefined()
      expect(subscription.unsubscribeToken).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      )
    })

    it("should create subscription with userId when provided", () => {
      const email = "test@example.com"
      const userId = "user-123"
      const subscription = Subscription.create(email, userId)

      expect(subscription.userId).toBe(userId)
      expect(subscription.isLinked).toBe(true)
    })

    it("should create subscription with default preferences", () => {
      const subscription = Subscription.create("test@example.com")

      expect(subscription.preferences.optOutFromScraping).toBe(false)
      expect(subscription.preferences.contentPreferences).toContain(
        "alumni_in_media"
      )
      expect(subscription.preferences.contentPreferences).toContain(
        "member_announcements"
      )
      expect(subscription.preferences.contentPreferences).toContain(
        "industry_trends"
      )
    })
  })

  describe("generateUnsubscribeToken", () => {
    it("should generate a valid UUID token", () => {
      const token = Subscription.generateUnsubscribeToken()

      expect(token).toBeDefined()
      expect(token).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      )
    })

    it("should generate unique tokens", () => {
      const token1 = Subscription.generateUnsubscribeToken()
      const token2 = Subscription.generateUnsubscribeToken()

      expect(token1).not.toBe(token2)
    })
  })

  describe("unsubscribe", () => {
    it("should unsubscribe an active subscription", () => {
      const subscription = Subscription.create("test@example.com")

      subscription.unsubscribe()

      expect(subscription.status).toBe("unsubscribed")
      expect(subscription.isActive).toBe(false)
      expect(subscription.unsubscribedAt).toBeInstanceOf(Date)
    })

    it("should throw error when unsubscribing already unsubscribed subscription", () => {
      const subscription = Subscription.create("test@example.com")
      subscription.unsubscribe()

      expect(() => subscription.unsubscribe()).toThrow("Already unsubscribed")
    })
  })

  describe("resubscribe", () => {
    it("should resubscribe an unsubscribed subscription", () => {
      const subscription = Subscription.create("test@example.com")
      subscription.unsubscribe()

      subscription.resubscribe()

      expect(subscription.status).toBe("active")
      expect(subscription.isActive).toBe(true)
      expect(subscription.unsubscribedAt).toBeNull()
    })
  })

  describe("linkToUser", () => {
    it("should link subscription to a user", () => {
      const subscription = Subscription.create("test@example.com")
      const userId = "user-123"

      subscription.linkToUser(userId)

      expect(subscription.userId).toBe(userId)
      expect(subscription.isLinked).toBe(true)
    })
  })

  describe("updatePreferences", () => {
    it("should update subscription preferences", () => {
      const subscription = Subscription.create("test@example.com")

      subscription.updatePreferences({
        optOutFromScraping: true,
        contentPreferences: ["alumni_in_media"],
      })

      expect(subscription.preferences.optOutFromScraping).toBe(true)
      expect(subscription.preferences.contentPreferences).toEqual([
        "alumni_in_media",
      ])
    })

    it("should partially update preferences", () => {
      const subscription = Subscription.create("test@example.com")

      subscription.updatePreferences({
        optOutFromScraping: true,
      })

      expect(subscription.preferences.optOutFromScraping).toBe(true)
      expect(subscription.preferences.contentPreferences).toContain(
        "alumni_in_media"
      )
    })
  })

  describe("fromPrimitives and toPrimitives", () => {
    it("should convert to and from primitives correctly", () => {
      const subscription = Subscription.create("test@example.com", "user-123")
      const primitives = subscription.toPrimitives()

      const restored = Subscription.fromPrimitives(primitives)

      expect(restored.id).toBe(subscription.id)
      expect(restored.email).toBe(subscription.email)
      expect(restored.userId).toBe(subscription.userId)
      expect(restored.status).toBe(subscription.status)
      expect(restored.unsubscribeToken).toBe(subscription.unsubscribeToken)
      expect(restored.subscribedAt.getTime()).toBe(
        subscription.subscribedAt.getTime()
      )
    })
  })
})
