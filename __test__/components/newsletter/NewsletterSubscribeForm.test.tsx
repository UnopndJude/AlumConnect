import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { NewsletterSubscribeForm } from "@/components/newsletter/NewsletterSubscribeForm"

describe("NewsletterSubscribeForm", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    global.fetch = vi.fn()
  })

  it("renders email input and submit button", () => {
    render(<NewsletterSubscribeForm />)

    expect(
      screen.getByPlaceholderText("이메일 주소를 입력하세요")
    ).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "구독하기" })).toBeInTheDocument()
  })

  it("shows error for empty email", async () => {
    const user = userEvent.setup()
    render(<NewsletterSubscribeForm />)

    const submitButton = screen.getByRole("button", { name: "구독하기" })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText("이메일을 입력해주세요")).toBeInTheDocument()
    })
  })

  it("shows error for invalid email format", async () => {
    const user = userEvent.setup()
    render(<NewsletterSubscribeForm />)

    const emailInput = screen.getByPlaceholderText("이메일 주소를 입력하세요")
    const submitButton = screen.getByRole("button", { name: "구독하기" })

    await user.type(emailInput, "invalid-email")
    await user.click(submitButton)

    await waitFor(() => {
      expect(
        screen.getByText("올바른 이메일 형식을 입력해주세요")
      ).toBeInTheDocument()
    })
  })

  it("successfully subscribes with valid email", async () => {
    const user = userEvent.setup()
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ message: "뉴스레터 구독이 완료되었습니다!" }),
    })
    global.fetch = mockFetch

    render(<NewsletterSubscribeForm />)

    const emailInput = screen.getByPlaceholderText("이메일 주소를 입력하세요")
    const submitButton = screen.getByRole("button", { name: "구독하기" })

    await user.type(emailInput, "test@example.com")
    await user.click(submitButton)

    await waitFor(() => {
      expect(
        screen.getByText("뉴스레터 구독이 완료되었습니다!")
      ).toBeInTheDocument()
    })

    expect(mockFetch).toHaveBeenCalledWith("/api/newsletter/subscribe", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: "test@example.com" }),
    })

    // Email input should be cleared
    expect(emailInput).toHaveValue("")
  })

  it("shows error message when API returns error", async () => {
    const user = userEvent.setup()
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ error: "구독에 실패했습니다" }),
    })
    global.fetch = mockFetch

    render(<NewsletterSubscribeForm />)

    const emailInput = screen.getByPlaceholderText("이메일 주소를 입력하세요")
    const submitButton = screen.getByRole("button", { name: "구독하기" })

    await user.type(emailInput, "test@example.com")
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText("구독에 실패했습니다")).toBeInTheDocument()
    })
  })

  it("shows error message when network fails", async () => {
    const user = userEvent.setup()
    const mockFetch = vi.fn().mockRejectedValue(new Error("Network error"))
    global.fetch = mockFetch

    render(<NewsletterSubscribeForm />)

    const emailInput = screen.getByPlaceholderText("이메일 주소를 입력하세요")
    const submitButton = screen.getByRole("button", { name: "구독하기" })

    await user.type(emailInput, "test@example.com")
    await user.click(submitButton)

    await waitFor(() => {
      expect(
        screen.getByText("네트워크 오류가 발생했습니다. 다시 시도해주세요.")
      ).toBeInTheDocument()
    })
  })

  it("disables input and button during submission", async () => {
    const user = userEvent.setup()
    const mockFetch = vi.fn().mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                ok: true,
                json: async () => ({ message: "Success" }),
              }),
            100
          )
        )
    )
    global.fetch = mockFetch

    render(<NewsletterSubscribeForm />)

    const emailInput = screen.getByPlaceholderText("이메일 주소를 입력하세요")
    const submitButton = screen.getByRole("button", { name: "구독하기" })

    await user.type(emailInput, "test@example.com")
    await user.click(submitButton)

    // Should show loading state
    expect(screen.getByRole("button", { name: "구독 중..." })).toBeDisabled()
    expect(emailInput).toBeDisabled()

    // Wait for completion
    await waitFor(() => {
      expect(screen.getByText("Success")).toBeInTheDocument()
    })

    // Should be enabled again
    expect(screen.getByRole("button", { name: "구독하기" })).toBeEnabled()
    expect(emailInput).toBeEnabled()
  })
})
