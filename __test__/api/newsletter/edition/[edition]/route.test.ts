import { describe, it, expect, beforeEach, vi } from "vitest"
import { GET } from "@/app/api/newsletter/edition/[edition]/route"
import { container } from "@/infrastructure/di/container"
import { Newsletter } from "@/domain/newsletter/entities/Newsletter"
import { NewsletterSection } from "@/domain/newsletter/entities/NewsletterSection"
import { NextRequest } from "next/server"

vi.mock("@/infrastructure/di/container", () => ({
  container: {
    getNewsletterRepository: vi.fn(),
  },
}))

describe("GET /api/newsletter/edition/[edition]", () => {
  const mockNewsletterRepository = {
    findByEdition: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(container.getNewsletterRepository).mockReturnValue(
      mockNewsletterRepository as any
    )
  })

  it("should return full newsletter with all sections and content by edition", async () => {
    const section1 = NewsletterSection.create({
      type: "alumni_in_media",
      title: "Alumni News",
      content: "Full content here",
      order: 1,
    })

    const section2 = NewsletterSection.create({
      type: "member_announcements",
      title: "Member Updates",
      content: "Member content here",
      order: 2,
    })

    const newsletter = Newsletter.create({
      edition: 5,
      title: "Newsletter Edition 5",
      sections: [section1, section2],
    })
    newsletter.publish()

    mockNewsletterRepository.findByEdition.mockResolvedValue(newsletter)

    const request = new NextRequest(
      new URL("http://localhost:3000/api/newsletter/edition/5")
    )
    const params = Promise.resolve({ edition: "5" })

    const response = await GET(request, { params })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.data.edition).toBe(5)
    expect(data.data.title).toBe("Newsletter Edition 5")
    expect(data.data.status).toBe("published")
    expect(data.data.publishedAt).toBeDefined()
    expect(data.data.sections).toHaveLength(2)
    expect(data.data.sections[0].content).toBe("Full content here")
    expect(data.data.sections[1].content).toBe("Member content here")
  })

  it("should return 404 when newsletter not found by edition", async () => {
    mockNewsletterRepository.findByEdition.mockResolvedValue(null)

    const request = new NextRequest(
      new URL("http://localhost:3000/api/newsletter/edition/999")
    )
    const params = Promise.resolve({ edition: "999" })

    const response = await GET(request, { params })
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data.success).toBe(false)
    expect(data.message).toBe("Newsletter not found.")
  })

  it("should return 404 when newsletter is draft (not published)", async () => {
    const section = NewsletterSection.create({
      type: "alumni_in_media",
      title: "Draft Section",
      content: "Draft content",
      order: 1,
    })

    const newsletter = Newsletter.create({
      edition: 3,
      title: "Draft Newsletter",
      sections: [section],
    })
    // Keep as draft, don't publish

    mockNewsletterRepository.findByEdition.mockResolvedValue(newsletter)

    const request = new NextRequest(
      new URL("http://localhost:3000/api/newsletter/edition/3")
    )
    const params = Promise.resolve({ edition: "3" })

    const response = await GET(request, { params })
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data.success).toBe(false)
    expect(data.message).toBe("Newsletter not found.")
  })

  it("should return 400 when edition is missing", async () => {
    const request = new NextRequest(
      new URL("http://localhost:3000/api/newsletter/edition/")
    )
    const params = Promise.resolve({ edition: "" })

    const response = await GET(request, { params })
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
    expect(data.message).toBe("Newsletter edition is required.")
  })

  it("should return 400 for invalid edition number (not a number)", async () => {
    const request = new NextRequest(
      new URL("http://localhost:3000/api/newsletter/edition/abc")
    )
    const params = Promise.resolve({ edition: "abc" })

    const response = await GET(request, { params })
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
    expect(data.message).toBe(
      "Invalid edition number. Must be a positive integer."
    )
  })

  it("should return 400 for invalid edition number (negative)", async () => {
    const request = new NextRequest(
      new URL("http://localhost:3000/api/newsletter/edition/-1")
    )
    const params = Promise.resolve({ edition: "-1" })

    const response = await GET(request, { params })
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
    expect(data.message).toBe(
      "Invalid edition number. Must be a positive integer."
    )
  })

  it("should return 400 for invalid edition number (zero)", async () => {
    const request = new NextRequest(
      new URL("http://localhost:3000/api/newsletter/edition/0")
    )
    const params = Promise.resolve({ edition: "0" })

    const response = await GET(request, { params })
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
    expect(data.message).toBe(
      "Invalid edition number. Must be a positive integer."
    )
  })

  it("should return 500 on repository error", async () => {
    mockNewsletterRepository.findByEdition.mockRejectedValue(
      new Error("Database error")
    )

    const request = new NextRequest(
      new URL("http://localhost:3000/api/newsletter/edition/5")
    )
    const params = Promise.resolve({ edition: "5" })

    const response = await GET(request, { params })
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.success).toBe(false)
    expect(data.message).toBe("Failed to fetch newsletter.")
  })
})
