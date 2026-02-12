import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import NewsletterList from "@/components/admin/NewsletterList"
import type { NewsletterPrimitives } from "@/domain/newsletter/entities/Newsletter"

// Mock fetch
global.fetch = vi.fn()

describe("NewsletterList", () => {
  const mockNewsletter: NewsletterPrimitives = {
    id: "newsletter-1",
    edition: 1,
    title: "Test Newsletter",
    sections: [
      {
        id: "section-1",
        type: "alumni_in_media",
        title: "Test Section",
        content: "Test Content",
        order: 0,
      },
    ],
    status: "draft",
    publishedAt: null,
    createdAt: new Date("2024-01-01"),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("renders newsletter list with drafts", () => {
    render(<NewsletterList initialNewsletters={[mockNewsletter]} />)

    expect(screen.getByText("뉴스레터 관리")).toBeInTheDocument()
    expect(screen.getByText("Test Newsletter")).toBeInTheDocument()
    expect(screen.getByText(/1개 섹션/)).toBeInTheDocument()
  })

  it("shows empty state when no newsletters", () => {
    render(<NewsletterList initialNewsletters={[]} />)

    expect(
      screen.getByText("아직 뉴스레터가 없습니다")
    ).toBeInTheDocument()
  })

  it("allows creating new newsletter", async () => {
    const user = userEvent.setup()
    render(<NewsletterList initialNewsletters={[]} />)

    const createButton = screen.getByText("새 뉴스레터")
    await user.click(createButton)

    expect(
      screen.getByText("새 뉴스레터 만들기")
    ).toBeInTheDocument()
  })

  it("allows publishing draft newsletter", async () => {
    const user = userEvent.setup()
    const publishedNewsletter = { ...mockNewsletter, status: "published" as const, publishedAt: new Date() }
    const mockFetch = vi.fn()
      .mockResolvedValueOnce({
        json: async () => ({ success: true, data: publishedNewsletter }),
      })
      .mockResolvedValueOnce({
        json: async () => ({ success: true, data: [publishedNewsletter] }),
      })
    global.fetch = mockFetch

    // Mock window.confirm
    window.confirm = vi.fn(() => true)

    render(<NewsletterList initialNewsletters={[mockNewsletter]} />)

    const publishButton = screen.getByRole("button", { name: /발행/ })
    await user.click(publishButton)

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        "/api/admin/newsletter/newsletter-1/publish",
        { method: "POST" }
      )
    })
  })

  it("shows published newsletters separately", () => {
    const publishedNewsletter: NewsletterPrimitives = {
      ...mockNewsletter,
      id: "newsletter-2",
      status: "published",
      publishedAt: new Date("2024-01-15"),
    }

    render(
      <NewsletterList
        initialNewsletters={[mockNewsletter, publishedNewsletter]}
      />
    )

    expect(screen.getByText(/임시 저장/)).toBeInTheDocument()
    expect(screen.getAllByText(/발행됨/)[0]).toBeInTheDocument()
  })

  it("disables publish button when newsletter has no sections", () => {
    const emptyNewsletter: NewsletterPrimitives = {
      ...mockNewsletter,
      sections: [],
    }

    render(<NewsletterList initialNewsletters={[emptyNewsletter]} />)

    const publishButton = screen.getByRole("button", { name: /발행/ })
    expect(publishButton).toBeDisabled()
  })
})
