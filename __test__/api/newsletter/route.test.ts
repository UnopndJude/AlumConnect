import { describe, it, expect, beforeEach, vi } from "vitest"
import { GET } from "@/app/api/newsletter/route"
import { container } from "@/infrastructure/di/container"
import { Newsletter } from "@/domain/newsletter/entities/Newsletter"
import { NewsletterSection } from "@/domain/newsletter/entities/NewsletterSection"
import { NextRequest } from "next/server"

vi.mock("@/infrastructure/di/container", () => ({
  container: {
    getNewsletterRepository: vi.fn(),
  },
}))

describe("GET /api/newsletter", () => {
  const mockNewsletterRepository = {
    findAllPublished: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(container.getNewsletterRepository).mockReturnValue(
      mockNewsletterRepository as any
    )
  })

  it("should return paginated list of published newsletters", async () => {
    // Create mock newsletters
    const section1 = NewsletterSection.create({
      type: "alumni_in_media",
      title: "Alumni News",
      content: "Some content here",
      order: 1,
    })

    const section2 = NewsletterSection.create({
      type: "industry_trends",
      title: "Industry Trends",
      content: "Industry content",
      order: 2,
    })

    const newsletter1 = Newsletter.create({
      edition: 2,
      title: "Newsletter Edition 2",
      sections: [section1],
    })
    newsletter1.publish()

    const newsletter2 = Newsletter.create({
      edition: 1,
      title: "Newsletter Edition 1",
      sections: [section2],
    })
    newsletter2.publish()

    mockNewsletterRepository.findAllPublished.mockResolvedValue([
      newsletter1,
      newsletter2,
    ])

    const request = new NextRequest(
      new URL("http://localhost:3000/api/newsletter?page=1&limit=10")
    )

    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.data).toHaveLength(2)
    expect(data.data[0].edition).toBe(2)
    expect(data.data[0].title).toBe("Newsletter Edition 2")
    expect(data.data[0].sections[0].title).toBe("Alumni News")
    expect(data.data[0].sections[0].content).toBeUndefined() // Content should be omitted
    expect(data.pagination).toEqual({
      page: 1,
      limit: 10,
      totalCount: 2,
      totalPages: 1,
      hasNextPage: false,
      hasPreviousPage: false,
    })
  })

  it("should return paginated results with correct page 2", async () => {
    // Create 15 mock newsletters
    const newsletters = []
    for (let i = 15; i >= 1; i--) {
      const section = NewsletterSection.create({
        type: "alumni_in_media",
        title: `Section ${i}`,
        content: `Content ${i}`,
        order: 1,
      })
      const newsletter = Newsletter.create({
        edition: i,
        title: `Newsletter ${i}`,
        sections: [section],
      })
      newsletter.publish()
      newsletters.push(newsletter)
    }

    mockNewsletterRepository.findAllPublished.mockResolvedValue(newsletters)

    const request = new NextRequest(
      new URL("http://localhost:3000/api/newsletter?page=2&limit=10")
    )

    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.data).toHaveLength(5)
    expect(data.data[0].edition).toBe(5)
    expect(data.pagination).toEqual({
      page: 2,
      limit: 10,
      totalCount: 15,
      totalPages: 2,
      hasNextPage: false,
      hasPreviousPage: true,
    })
  })

  it("should return empty array when no newsletters exist", async () => {
    mockNewsletterRepository.findAllPublished.mockResolvedValue([])

    const request = new NextRequest(
      new URL("http://localhost:3000/api/newsletter?page=1&limit=10")
    )

    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.data).toHaveLength(0)
    expect(data.pagination).toEqual({
      page: 1,
      limit: 10,
      totalCount: 0,
      totalPages: 0,
      hasNextPage: false,
      hasPreviousPage: false,
    })
  })

  it("should use default pagination values when not provided", async () => {
    mockNewsletterRepository.findAllPublished.mockResolvedValue([])

    const request = new NextRequest(
      new URL("http://localhost:3000/api/newsletter")
    )

    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.pagination.page).toBe(1)
    expect(data.pagination.limit).toBe(10)
  })

  it("should return 400 for invalid page parameter", async () => {
    const request = new NextRequest(
      new URL("http://localhost:3000/api/newsletter?page=0&limit=10")
    )

    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
    expect(data.message).toContain("Invalid pagination parameters")
  })

  it("should return 400 for invalid limit parameter", async () => {
    const request = new NextRequest(
      new URL("http://localhost:3000/api/newsletter?page=1&limit=101")
    )

    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
    expect(data.message).toContain("Invalid pagination parameters")
  })

  it("should return 500 on repository error", async () => {
    mockNewsletterRepository.findAllPublished.mockRejectedValue(
      new Error("Database error")
    )

    const request = new NextRequest(
      new URL("http://localhost:3000/api/newsletter?page=1&limit=10")
    )

    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.success).toBe(false)
    expect(data.message).toBe("Failed to fetch newsletters.")
  })
})
