import { describe, it, expect, beforeEach, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import { container } from "@/infrastructure/di/container"
import { Newsletter } from "@/domain/newsletter/entities/Newsletter"
import { NewsletterSection } from "@/domain/newsletter/entities/NewsletterSection"
import { redirect } from "next/navigation"

// Mock Next.js navigation
vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
}))

// Mock the container
vi.mock("@/infrastructure/di/container", () => ({
  container: {
    getNewsletterRepository: vi.fn(),
  },
}))

// Mock Next.js Link component
vi.mock("next/link", () => ({
  default: ({
    children,
    href,
  }: {
    children: React.ReactNode
    href: string
  }) => <a href={href}>{children}</a>,
}))

describe("Newsletter Detail Page", () => {
  const mockNewsletterRepository = {
    findById: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
    // Reset redirect to default implementation
    vi.mocked(redirect).mockImplementation((() => {}) as any)
    vi.mocked(container.getNewsletterRepository).mockReturnValue(
      mockNewsletterRepository as any
    )
  })

  it("should redirect to newsletter list if newsletter not found", async () => {
    // Make redirect throw so execution stops
    vi.mocked(redirect).mockImplementation(() => {
      throw new Error("REDIRECT")
    })

    mockNewsletterRepository.findById.mockResolvedValue(null)

    const NewsletterDetailPage = (await import("@/app/newsletter/[id]/page"))
      .default

    const params = Promise.resolve({ id: "non-existent-id" })

    await expect(NewsletterDetailPage({ params })).rejects.toThrow("REDIRECT")
    expect(redirect).toHaveBeenCalledWith("/newsletter")
  })

  it("should redirect to newsletter list if newsletter is not published", async () => {
    // Make redirect throw so execution stops
    vi.mocked(redirect).mockImplementation(() => {
      throw new Error("REDIRECT")
    })

    const section = NewsletterSection.create({
      type: "alumni_in_media",
      title: "Alumni News",
      content: "Content",
      order: 1,
    })

    const newsletter = Newsletter.create({
      edition: 1,
      title: "Draft Newsletter",
      sections: [section],
    })
    // Don't publish

    mockNewsletterRepository.findById.mockResolvedValue(newsletter)

    const NewsletterDetailPage = (await import("@/app/newsletter/[id]/page"))
      .default

    const params = Promise.resolve({ id: newsletter.id })

    await expect(NewsletterDetailPage({ params })).rejects.toThrow("REDIRECT")
    expect(redirect).toHaveBeenCalledWith("/newsletter")
  })

  it("should display newsletter details", async () => {
    const section1 = NewsletterSection.create({
      type: "alumni_in_media",
      title: "언론에 소개된 동문",
      content: "동문 A가 신문에 소개되었습니다.",
      order: 1,
    })

    const section2 = NewsletterSection.create({
      type: "member_announcements",
      title: "동문 소식",
      content: "동문 B가 새로운 회사를 창업했습니다.",
      order: 2,
    })

    const newsletter = Newsletter.create({
      edition: 5,
      title: "2024년 5월 뉴스레터",
      sections: [section1, section2],
    })
    newsletter.publish()

    mockNewsletterRepository.findById.mockResolvedValue(newsletter)

    const NewsletterDetailPage = (await import("@/app/newsletter/[id]/page"))
      .default

    const params = Promise.resolve({ id: newsletter.id })

    render(await NewsletterDetailPage({ params }))

    expect(screen.getByText("2024년 5월 뉴스레터")).toBeInTheDocument()
    expect(screen.getByText("#5호")).toBeInTheDocument()
    expect(
      screen.getByText("2개 섹션으로 구성되어 있습니다")
    ).toBeInTheDocument()
  })

  it("should display all sections in order", async () => {
    const section1 = NewsletterSection.create({
      type: "alumni_in_media",
      title: "First Section",
      content: "First content",
      order: 1,
    })

    const section2 = NewsletterSection.create({
      type: "member_announcements",
      title: "Second Section",
      content: "Second content",
      order: 2,
    })

    const section3 = NewsletterSection.create({
      type: "industry_trends",
      title: "Third Section",
      content: "Third content",
      order: 3,
    })

    const newsletter = Newsletter.create({
      edition: 1,
      title: "Test Newsletter",
      sections: [section3, section1, section2], // Out of order
    })
    newsletter.publish()

    mockNewsletterRepository.findById.mockResolvedValue(newsletter)

    const NewsletterDetailPage = (await import("@/app/newsletter/[id]/page"))
      .default

    const params = Promise.resolve({ id: newsletter.id })

    render(await NewsletterDetailPage({ params }))

    expect(screen.getByText("First Section")).toBeInTheDocument()
    expect(screen.getByText("Second Section")).toBeInTheDocument()
    expect(screen.getByText("Third Section")).toBeInTheDocument()
    expect(screen.getByText("First content")).toBeInTheDocument()
    expect(screen.getByText("Second content")).toBeInTheDocument()
    expect(screen.getByText("Third content")).toBeInTheDocument()
  })

  it("should display section type labels", async () => {
    const section1 = NewsletterSection.create({
      type: "alumni_in_media",
      title: "Section 1",
      content: "Content 1",
      order: 1,
    })

    const section2 = NewsletterSection.create({
      type: "member_announcements",
      title: "Section 2",
      content: "Content 2",
      order: 2,
    })

    const section3 = NewsletterSection.create({
      type: "industry_trends",
      title: "Section 3",
      content: "Content 3",
      order: 3,
    })

    const newsletter = Newsletter.create({
      edition: 1,
      title: "Test Newsletter",
      sections: [section1, section2, section3],
    })
    newsletter.publish()

    mockNewsletterRepository.findById.mockResolvedValue(newsletter)

    const NewsletterDetailPage = (await import("@/app/newsletter/[id]/page"))
      .default

    const params = Promise.resolve({ id: newsletter.id })

    render(await NewsletterDetailPage({ params }))

    expect(screen.getByText("언론에 소개된 동문")).toBeInTheDocument()
    expect(screen.getByText("동문 소식")).toBeInTheDocument()
    expect(screen.getByText("업계 동향")).toBeInTheDocument()
  })

  it("should display published date", async () => {
    const section = NewsletterSection.create({
      type: "alumni_in_media",
      title: "Section",
      content: "Content",
      order: 1,
    })

    const newsletter = Newsletter.create({
      edition: 1,
      title: "Test Newsletter",
      sections: [section],
    })
    newsletter.publish()

    mockNewsletterRepository.findById.mockResolvedValue(newsletter)

    const NewsletterDetailPage = (await import("@/app/newsletter/[id]/page"))
      .default

    const params = Promise.resolve({ id: newsletter.id })

    render(await NewsletterDetailPage({ params }))

    const publishedDate = newsletter.publishedAt
    if (publishedDate) {
      const dateString = publishedDate.toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
      expect(screen.getByText(dateString)).toBeInTheDocument()
    }
  })

  it("should have back link to newsletter list", async () => {
    const section = NewsletterSection.create({
      type: "alumni_in_media",
      title: "Section",
      content: "Content",
      order: 1,
    })

    const newsletter = Newsletter.create({
      edition: 1,
      title: "Test Newsletter",
      sections: [section],
    })
    newsletter.publish()

    mockNewsletterRepository.findById.mockResolvedValue(newsletter)

    const NewsletterDetailPage = (await import("@/app/newsletter/[id]/page"))
      .default

    const params = Promise.resolve({ id: newsletter.id })

    const { container } = render(await NewsletterDetailPage({ params }))

    const backLinks = container.querySelectorAll('a[href="/newsletter"]')
    expect(backLinks.length).toBeGreaterThan(0)
  })

  it("should display navigation elements", async () => {
    const section = NewsletterSection.create({
      type: "alumni_in_media",
      title: "Section",
      content: "Content",
      order: 1,
    })

    const newsletter = Newsletter.create({
      edition: 1,
      title: "Test Newsletter",
      sections: [section],
    })
    newsletter.publish()

    mockNewsletterRepository.findById.mockResolvedValue(newsletter)

    const NewsletterDetailPage = (await import("@/app/newsletter/[id]/page"))
      .default

    const params = Promise.resolve({ id: newsletter.id })

    render(await NewsletterDetailPage({ params }))

    expect(screen.getAllByText("AlumConnect").length).toBeGreaterThan(0)
    expect(screen.getByText("← 목록으로")).toBeInTheDocument()
  })

  it("should display footer", async () => {
    const section = NewsletterSection.create({
      type: "alumni_in_media",
      title: "Section",
      content: "Content",
      order: 1,
    })

    const newsletter = Newsletter.create({
      edition: 1,
      title: "Test Newsletter",
      sections: [section],
    })
    newsletter.publish()

    mockNewsletterRepository.findById.mockResolvedValue(newsletter)

    const NewsletterDetailPage = (await import("@/app/newsletter/[id]/page"))
      .default

    const params = Promise.resolve({ id: newsletter.id })

    render(await NewsletterDetailPage({ params }))

    expect(
      screen.getByText("인천과학고등학교 동문 커뮤니티")
    ).toBeInTheDocument()
    expect(screen.getByText("© 2024 AlumConnect")).toBeInTheDocument()
  })
})
