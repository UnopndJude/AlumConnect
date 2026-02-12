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

describe("Newsletter Edition Page", () => {
  const mockNewsletterRepository = {
    findByEdition: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
    // Reset redirect to default implementation
    vi.mocked(redirect).mockImplementation((() => {}) as any)
    vi.mocked(container.getNewsletterRepository).mockReturnValue(
      mockNewsletterRepository as any
    )
  })

  it("should redirect to newsletter list if edition is invalid", async () => {
    // Make redirect throw so execution stops
    vi.mocked(redirect).mockImplementation(() => {
      throw new Error("REDIRECT")
    })

    const NewsletterEditionPage = (
      await import("@/app/newsletter/edition/[edition]/page")
    ).default

    const params = Promise.resolve({ edition: "invalid" })

    await expect(NewsletterEditionPage({ params })).rejects.toThrow("REDIRECT")
    expect(redirect).toHaveBeenCalledWith("/newsletter")
  })

  it("should redirect to newsletter list if newsletter not found", async () => {
    // Make redirect throw so execution stops
    vi.mocked(redirect).mockImplementation(() => {
      throw new Error("REDIRECT")
    })

    mockNewsletterRepository.findByEdition.mockResolvedValue(null)

    const NewsletterEditionPage = (
      await import("@/app/newsletter/edition/[edition]/page")
    ).default

    const params = Promise.resolve({ edition: "5" })

    await expect(NewsletterEditionPage({ params })).rejects.toThrow("REDIRECT")
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
      edition: 5,
      title: "Draft Newsletter",
      sections: [section],
    })
    // Don't publish

    mockNewsletterRepository.findByEdition.mockResolvedValue(newsletter)

    const NewsletterEditionPage = (
      await import("@/app/newsletter/edition/[edition]/page")
    ).default

    const params = Promise.resolve({ edition: "5" })

    await expect(NewsletterEditionPage({ params })).rejects.toThrow("REDIRECT")
    expect(redirect).toHaveBeenCalledWith("/newsletter")
  })

  it("should display newsletter by edition number", async () => {
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
      edition: 10,
      title: "2024년 10월 뉴스레터",
      sections: [section1, section2],
    })
    newsletter.publish()

    mockNewsletterRepository.findByEdition.mockResolvedValue(newsletter)

    const NewsletterEditionPage = (
      await import("@/app/newsletter/edition/[edition]/page")
    ).default

    const params = Promise.resolve({ edition: "10" })

    render(await NewsletterEditionPage({ params }))

    expect(screen.getByText("2024년 10월 뉴스레터")).toBeInTheDocument()
    expect(screen.getByText("#10호")).toBeInTheDocument()
    expect(mockNewsletterRepository.findByEdition).toHaveBeenCalledWith(10)
  })

  it("should display all sections with correct content", async () => {
    const section1 = NewsletterSection.create({
      type: "alumni_in_media",
      title: "First Section",
      content: "First content here",
      order: 1,
    })

    const section2 = NewsletterSection.create({
      type: "industry_trends",
      title: "Second Section",
      content: "Second content here",
      order: 2,
    })

    const newsletter = Newsletter.create({
      edition: 3,
      title: "Test Newsletter",
      sections: [section2, section1], // Out of order
    })
    newsletter.publish()

    mockNewsletterRepository.findByEdition.mockResolvedValue(newsletter)

    const NewsletterEditionPage = (
      await import("@/app/newsletter/edition/[edition]/page")
    ).default

    const params = Promise.resolve({ edition: "3" })

    render(await NewsletterEditionPage({ params }))

    expect(screen.getByText("First Section")).toBeInTheDocument()
    expect(screen.getByText("Second Section")).toBeInTheDocument()
    expect(screen.getByText("First content here")).toBeInTheDocument()
    expect(screen.getByText("Second content here")).toBeInTheDocument()
  })

  it("should display section type labels correctly", async () => {
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

    mockNewsletterRepository.findByEdition.mockResolvedValue(newsletter)

    const NewsletterEditionPage = (
      await import("@/app/newsletter/edition/[edition]/page")
    ).default

    const params = Promise.resolve({ edition: "1" })

    render(await NewsletterEditionPage({ params }))

    expect(screen.getByText("언론에 소개된 동문")).toBeInTheDocument()
    expect(screen.getByText("동문 소식")).toBeInTheDocument()
    expect(screen.getByText("업계 동향")).toBeInTheDocument()
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

    mockNewsletterRepository.findByEdition.mockResolvedValue(newsletter)

    const NewsletterEditionPage = (
      await import("@/app/newsletter/edition/[edition]/page")
    ).default

    const params = Promise.resolve({ edition: "1" })

    const { container } = render(await NewsletterEditionPage({ params }))

    const backLinks = container.querySelectorAll('a[href="/newsletter"]')
    expect(backLinks.length).toBeGreaterThan(0)
  })

  it("should display published date", async () => {
    const section = NewsletterSection.create({
      type: "alumni_in_media",
      title: "Section",
      content: "Content",
      order: 1,
    })

    const newsletter = Newsletter.create({
      edition: 7,
      title: "Test Newsletter",
      sections: [section],
    })
    newsletter.publish()

    mockNewsletterRepository.findByEdition.mockResolvedValue(newsletter)

    const NewsletterEditionPage = (
      await import("@/app/newsletter/edition/[edition]/page")
    ).default

    const params = Promise.resolve({ edition: "7" })

    render(await NewsletterEditionPage({ params }))

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

  it("should handle edge case edition numbers", async () => {
    const section = NewsletterSection.create({
      type: "alumni_in_media",
      title: "Section",
      content: "Content",
      order: 1,
    })

    const newsletter = Newsletter.create({
      edition: 100,
      title: "100th Edition",
      sections: [section],
    })
    newsletter.publish()

    mockNewsletterRepository.findByEdition.mockResolvedValue(newsletter)

    const NewsletterEditionPage = (
      await import("@/app/newsletter/edition/[edition]/page")
    ).default

    const params = Promise.resolve({ edition: "100" })

    render(await NewsletterEditionPage({ params }))

    expect(screen.getByText("#100호")).toBeInTheDocument()
    expect(mockNewsletterRepository.findByEdition).toHaveBeenCalledWith(100)
  })
})
