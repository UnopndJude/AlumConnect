import { describe, it, expect, beforeEach, vi } from "vitest"
import { GET } from "@/app/api/newsletter/[id]/route"
import { container } from "@/infrastructure/di/container"
import { Newsletter } from "@/domain/newsletter/entities/Newsletter"
import { NewsletterSection } from "@/domain/newsletter/entities/NewsletterSection"
import { NextRequest } from "next/server"

vi.mock("@/infrastructure/di/container", () => ({
  container: {
    getNewsletterRepository: vi.fn(),
  },
}))

describe("GET /api/newsletter/[id]", () => {
  const mockNewsletterRepository = {
    findById: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(container.getNewsletterRepository).mockReturnValue(
      mockNewsletterRepository as any
    )
  })

  it("should return full newsletter with all sections and content", async () => {
    const section1 = NewsletterSection.create({
      type: "alumni_in_media",
      title: "Alumni News",
      content: "Full content here",
      order: 1,
    })

    const section2 = NewsletterSection.create({
      type: "industry_trends",
      title: "Industry Trends",
      content: "Industry content here",
      order: 2,
    })

    const newsletter = Newsletter.create({
      edition: 1,
      title: "Newsletter Edition 1",
      sections: [section1, section2],
    })
    newsletter.publish()

    mockNewsletterRepository.findById.mockResolvedValue(newsletter)

    const request = new NextRequest(
      new URL("http://localhost:3000/api/newsletter/123")
    )
    const params = Promise.resolve({ id: newsletter.id })

    const response = await GET(request, { params })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.data.id).toBe(newsletter.id)
    expect(data.data.edition).toBe(1)
    expect(data.data.title).toBe("Newsletter Edition 1")
    expect(data.data.status).toBe("published")
    expect(data.data.publishedAt).toBeDefined()
    expect(data.data.sections).toHaveLength(2)
    expect(data.data.sections[0].content).toBe("Full content here")
    expect(data.data.sections[1].content).toBe("Industry content here")
  })

  it("should return 404 when newsletter not found", async () => {
    mockNewsletterRepository.findById.mockResolvedValue(null)

    const request = new NextRequest(
      new URL("http://localhost:3000/api/newsletter/nonexistent")
    )
    const params = Promise.resolve({ id: "nonexistent" })

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
      edition: 1,
      title: "Draft Newsletter",
      sections: [section],
    })
    // Don't publish it - keep it as draft

    mockNewsletterRepository.findById.mockResolvedValue(newsletter)

    const request = new NextRequest(
      new URL("http://localhost:3000/api/newsletter/123")
    )
    const params = Promise.resolve({ id: newsletter.id })

    const response = await GET(request, { params })
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data.success).toBe(false)
    expect(data.message).toBe("Newsletter not found.")
  })

  it("should return 400 when id is missing", async () => {
    const request = new NextRequest(
      new URL("http://localhost:3000/api/newsletter/")
    )
    const params = Promise.resolve({ id: "" })

    const response = await GET(request, { params })
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
    expect(data.message).toBe("Newsletter ID is required.")
  })

  it("should return 500 on repository error", async () => {
    mockNewsletterRepository.findById.mockRejectedValue(
      new Error("Database error")
    )

    const request = new NextRequest(
      new URL("http://localhost:3000/api/newsletter/123")
    )
    const params = Promise.resolve({ id: "123" })

    const response = await GET(request, { params })
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.success).toBe(false)
    expect(data.message).toBe("Failed to fetch newsletter.")
  })
})
