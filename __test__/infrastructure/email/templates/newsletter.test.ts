import { describe, it, expect } from "vitest"
import {
  Newsletter,
  NewsletterProps,
} from "@/domain/newsletter/entities/Newsletter"
import { NewsletterSection } from "@/domain/newsletter/entities/NewsletterSection"
import {
  generateNewsletterHtml,
  generateNewsletterText,
} from "@/infrastructure/email/templates/newsletter"

describe("Newsletter Email Templates", () => {
  const mockNewsletter = Newsletter.fromPrimitives({
    id: "test-id",
    edition: 5,
    title: "Test Newsletter Title",
    sections: [
      NewsletterSection.fromPrimitives({
        id: "section-1",
        type: "alumni_in_media",
        title: "Alumni News Section",
        content: "This is alumni news content.\n\nWith multiple paragraphs.",
        order: 1,
      }),
      NewsletterSection.fromPrimitives({
        id: "section-2",
        type: "industry_trends",
        title: "Industry Trends",
        content: "Industry news here.",
        order: 2,
      }),
    ],
    status: "published",
    publishedAt: new Date("2024-01-15"),
    createdAt: new Date("2024-01-14"),
  })

  describe("generateNewsletterHtml", () => {
    it("should generate valid HTML with all sections", () => {
      const html = generateNewsletterHtml(mockNewsletter, {
        unsubscribeToken: "test-token",
        baseUrl: "https://example.com",
      })

      expect(html).toContain("<!DOCTYPE html>")
      expect(html).toContain("AlumConnect Newsletter")
      expect(html).toContain("제 5호")
      expect(html).toContain("Test Newsletter Title")
      expect(html).toContain("동문 소식")
      expect(html).toContain("Alumni News Section")
      expect(html).toContain("업계 동향")
      expect(html).toContain("Industry Trends")
      expect(html).toContain(
        "https://example.com/api/newsletter/unsubscribe?token=test-token"
      )
      expect(html).toContain("수신거부")
    })

    it("should format sections in correct order", () => {
      const html = generateNewsletterHtml(mockNewsletter, {
        unsubscribeToken: "test-token",
        baseUrl: "https://example.com",
      })

      const section1Index = html.indexOf("Alumni News Section")
      const section2Index = html.indexOf("Industry Trends")

      expect(section1Index).toBeLessThan(section2Index)
    })

    it("should include date formatting", () => {
      const html = generateNewsletterHtml(mockNewsletter, {
        unsubscribeToken: "test-token",
        baseUrl: "https://example.com",
      })

      expect(html).toContain("2024년 01월 15일")
    })
  })

  describe("generateNewsletterText", () => {
    it("should generate plain text version", () => {
      const text = generateNewsletterText(mockNewsletter)

      expect(text).toContain("AlumConnect Newsletter - 제 5호")
      expect(text).toContain("2024년 01월 15일")
      expect(text).toContain("Test Newsletter Title")
      expect(text).toContain("동문 소식")
      expect(text).toContain("Alumni News Section")
      expect(text).toContain("업계 동향")
      expect(text).toContain("Industry Trends")
      expect(text).toContain("수신거부: {unsubscribeUrl}")
    })

    it("should strip HTML tags from content", () => {
      const text = generateNewsletterText(mockNewsletter)

      expect(text).not.toContain("<p>")
      expect(text).not.toContain("</p>")
      expect(text).not.toContain("<br>")
    })

    it("should format sections with separators", () => {
      const text = generateNewsletterText(mockNewsletter)

      expect(text).toMatch(/동문 소식\n=+/)
      expect(text).toMatch(/업계 동향\n=+/)
    })
  })

  describe("edge cases", () => {
    it("should handle newsletter with no published date", () => {
      const primitives = mockNewsletter.toPrimitives()
      const draftNewsletter = Newsletter.fromPrimitives({
        ...primitives,
        publishedAt: null,
        status: "draft",
      } as NewsletterProps)

      const html = generateNewsletterHtml(draftNewsletter, {
        unsubscribeToken: "token",
        baseUrl: "https://example.com",
      })

      expect(html).toContain("AlumConnect Newsletter")
    })

    it("should handle empty sections array", () => {
      const primitives = mockNewsletter.toPrimitives()
      const emptyNewsletter = Newsletter.fromPrimitives({
        ...primitives,
        sections: [],
      } as NewsletterProps)

      const html = generateNewsletterHtml(emptyNewsletter, {
        unsubscribeToken: "token",
        baseUrl: "https://example.com",
      })

      expect(html).toContain("AlumConnect Newsletter")
      expect(html).toContain("Test Newsletter Title")
    })
  })
})
