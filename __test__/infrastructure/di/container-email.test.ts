import { describe, it, expect, beforeEach, afterEach, vi } from "vitest"

// Mock Supabase before importing container
vi.mock("@/infrastructure/supabase/client", () => ({
  getServiceRoleClient: vi.fn(),
}))

vi.mock("@/infrastructure/supabase/auth", () => ({
  getCurrentUser: vi.fn(),
}))

vi.mock("resend", () => ({
  Resend: vi.fn(() => ({
    emails: {
      send: vi.fn(),
    },
  })),
}))

import { container } from "@/infrastructure/di/container"
import { ConsoleEmailService } from "@/infrastructure/email/ConsoleEmailService"
import { IEmailService } from "@/domain/email/services/IEmailService"

describe("DI Container - Email Service", () => {
  const originalEnv = process.env.RESEND_API_KEY

  afterEach(() => {
    // Restore original env
    if (originalEnv) {
      process.env.RESEND_API_KEY = originalEnv
    } else {
      delete process.env.RESEND_API_KEY
    }
  })

  it("should return ConsoleEmailService when RESEND_API_KEY is not set", () => {
    delete process.env.RESEND_API_KEY

    // Force re-initialization by accessing the service
    const emailService = container.getEmailService()

    expect(emailService).toBeDefined()
    expect(emailService).toBeInstanceOf(ConsoleEmailService)
  })

  it("should provide working email service", async () => {
    const emailService = container.getEmailService()

    const result = await emailService.send({
      to: { email: "test@example.com", name: "Test User" },
      subject: "Test Email",
      html: "<p>Test content</p>",
      text: "Test content",
    })

    expect(result.success).toBe(true)
    expect(result.messageId).toBeDefined()
  })

  it("should provide working batch send", async () => {
    const emailService = container.getEmailService()

    const result = await emailService.sendBatch([
      {
        to: { email: "user1@example.com" },
        subject: "Email 1",
        html: "<p>Content 1</p>",
      },
      {
        to: { email: "user2@example.com" },
        subject: "Email 2",
        html: "<p>Content 2</p>",
      },
    ])

    expect(result.success).toBe(true)
    expect(result.sent).toBe(2)
    expect(result.failed).toBe(0)
  })
})
