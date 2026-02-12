import { describe, it, expect, beforeEach, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import { container } from "@/infrastructure/di/container"
import { Newsletter } from "@/domain/newsletter/entities/Newsletter"
import { NewsletterSection } from "@/domain/newsletter/entities/NewsletterSection"

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

describe("Newsletter List Page", () => {
  const mockNewsletterRepository = {
    findAllPublished: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(container.getNewsletterRepository).mockReturnValue(
      mockNewsletterRepository as any
    )
  })

  it("should display empty state when no newsletters exist", async () => {
    mockNewsletterRepository.findAllPublished.mockResolvedValue([])

    const NewsletterListPage = (await import("@/app/newsletter/page")).default

    render(await NewsletterListPage())

    expect(
      screen.getByText("아직 발행된 뉴스레터가 없습니다")
    ).toBeInTheDocument()
    expect(
      screen.getByText("첫 번째 뉴스레터가 곧 발행될 예정입니다")
    ).toBeInTheDocument()
  })

  it("should display list of published newsletters", async () => {
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
      edition: 1,
      title: "2024년 1월 뉴스레터",
      sections: [section1],
    })
    newsletter1.publish()

    const newsletter2 = Newsletter.create({
      edition: 2,
      title: "2024년 2월 뉴스레터",
      sections: [section2],
    })
    newsletter2.publish()

    mockNewsletterRepository.findAllPublished.mockResolvedValue([
      newsletter1,
      newsletter2,
    ])

    const NewsletterListPage = (await import("@/app/newsletter/page")).default

    render(await NewsletterListPage())

    expect(screen.getByText("2024년 1월 뉴스레터")).toBeInTheDocument()
    expect(screen.getByText("2024년 2월 뉴스레터")).toBeInTheDocument()
    expect(screen.getByText("#1호")).toBeInTheDocument()
    expect(screen.getByText("#2호")).toBeInTheDocument()
  })

  it("should display section count for each newsletter", async () => {
    const section1 = NewsletterSection.create({
      type: "alumni_in_media",
      title: "Alumni News",
      content: "Some content",
      order: 1,
    })

    const section2 = NewsletterSection.create({
      type: "industry_trends",
      title: "Industry Trends",
      content: "Industry content",
      order: 2,
    })

    const newsletter = Newsletter.create({
      edition: 1,
      title: "Test Newsletter",
      sections: [section1, section2],
    })
    newsletter.publish()

    mockNewsletterRepository.findAllPublished.mockResolvedValue([newsletter])

    const NewsletterListPage = (await import("@/app/newsletter/page")).default

    render(await NewsletterListPage())

    expect(screen.getByText("2개 섹션")).toBeInTheDocument()
  })

  it("should display published date for each newsletter", async () => {
    const section = NewsletterSection.create({
      type: "alumni_in_media",
      title: "Alumni News",
      content: "Content",
      order: 1,
    })

    const newsletter = Newsletter.create({
      edition: 1,
      title: "Test Newsletter",
      sections: [section],
    })
    newsletter.publish()

    mockNewsletterRepository.findAllPublished.mockResolvedValue([newsletter])

    const NewsletterListPage = (await import("@/app/newsletter/page")).default

    render(await NewsletterListPage())

    // Published date should be displayed
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

  it("should have links to individual newsletter pages", async () => {
    const section = NewsletterSection.create({
      type: "alumni_in_media",
      title: "Alumni News",
      content: "Content",
      order: 1,
    })

    const newsletter = Newsletter.create({
      edition: 1,
      title: "Test Newsletter",
      sections: [section],
    })
    newsletter.publish()

    mockNewsletterRepository.findAllPublished.mockResolvedValue([newsletter])

    const NewsletterListPage = (await import("@/app/newsletter/page")).default

    const { container } = render(await NewsletterListPage())

    const link = container.querySelector(
      `a[href="/newsletter/${newsletter.id}"]`
    )
    expect(link).toBeInTheDocument()
  })

  it("should display navigation elements", async () => {
    mockNewsletterRepository.findAllPublished.mockResolvedValue([])

    const NewsletterListPage = (await import("@/app/newsletter/page")).default

    render(await NewsletterListPage())

    expect(screen.getAllByText("AlumConnect").length).toBeGreaterThan(0)
    expect(screen.getByText("홈으로")).toBeInTheDocument()
    expect(screen.getByText("동문 뉴스레터")).toBeInTheDocument()
  })

  it("should display footer", async () => {
    mockNewsletterRepository.findAllPublished.mockResolvedValue([])

    const NewsletterListPage = (await import("@/app/newsletter/page")).default

    render(await NewsletterListPage())

    expect(
      screen.getByText("인천과학고등학교 동문 커뮤니티")
    ).toBeInTheDocument()
    expect(screen.getByText("© 2024 AlumConnect")).toBeInTheDocument()
  })
})
