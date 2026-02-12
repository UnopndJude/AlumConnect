import { describe, it, expect, vi, beforeEach } from "vitest"
import { ConsoleEmailService } from "@/infrastructure/email/ConsoleEmailService"
import { EmailMessage } from "@/domain/email/services/IEmailService"

describe("ConsoleEmailService", () => {
  let emailService: ConsoleEmailService
  let consoleSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    emailService = new ConsoleEmailService()
    consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {})
  })

  describe("send", () => {
    it("should send email to single recipient", async () => {
      const message: EmailMessage = {
        to: { email: "test@example.com", name: "Test User" },
        subject: "Test Subject",
        html: "<p>Test HTML content</p>",
        text: "Test text content",
      }

      const result = await emailService.send(message)

      expect(result.success).toBe(true)
      expect(result.messageId).toBeDefined()
      expect(result.messageId).toMatch(/^console-/)
      expect(consoleSpy).toHaveBeenCalled()
    })

    it("should send email to multiple recipients", async () => {
      const message: EmailMessage = {
        to: [
          { email: "test1@example.com", name: "User 1" },
          { email: "test2@example.com", name: "User 2" },
        ],
        subject: "Test Subject",
        html: "<p>Test HTML content</p>",
      }

      const result = await emailService.send(message)

      expect(result.success).toBe(true)
      expect(result.messageId).toBeDefined()
    })

    it("should handle recipient without name", async () => {
      const message: EmailMessage = {
        to: { email: "test@example.com" },
        subject: "Test Subject",
        html: "<p>Test HTML content</p>",
      }

      const result = await emailService.send(message)

      expect(result.success).toBe(true)
      expect(result.messageId).toBeDefined()
    })
  })

  describe("sendBatch", () => {
    it("should send multiple emails successfully", async () => {
      const messages: EmailMessage[] = [
        {
          to: { email: "test1@example.com" },
          subject: "Subject 1",
          html: "<p>Content 1</p>",
        },
        {
          to: { email: "test2@example.com" },
          subject: "Subject 2",
          html: "<p>Content 2</p>",
        },
      ]

      const result = await emailService.sendBatch(messages)

      expect(result.success).toBe(true)
      expect(result.sent).toBe(2)
      expect(result.failed).toBe(0)
    })

    it("should handle empty batch", async () => {
      const result = await emailService.sendBatch([])

      expect(result.success).toBe(true)
      expect(result.sent).toBe(0)
      expect(result.failed).toBe(0)
    })
  })
})
