import { describe, it, expect, vi, beforeEach } from "vitest"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { container } from "@/infrastructure/di/container"
import AdminNewsletterPage from "@/app/admin/newsletter/page"

// Mock Next.js modules
vi.mock("next/headers", () => ({
  cookies: vi.fn(),
}))

vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
}))

vi.mock("@/infrastructure/di/container", () => ({
  container: {
    getUserRepository: vi.fn(),
    getNewsletterRepository: vi.fn(),
    getAnnouncementRepository: vi.fn(),
    getSubscriptionRepository: vi.fn(),
  },
}))

describe("Admin Newsletter Page", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("redirects to login if user is not authenticated", async () => {
    const mockCookies = {
      get: vi.fn().mockReturnValue(undefined),
    }
    vi.mocked(cookies).mockResolvedValue(mockCookies as any)

    // Mock redirect to throw an error to stop execution
    vi.mocked(redirect).mockImplementation(() => {
      throw new Error("REDIRECT")
    })

    try {
      await AdminNewsletterPage()
    } catch (error: any) {
      expect(error.message).toBe("REDIRECT")
    }

    expect(redirect).toHaveBeenCalledWith("/login")
  })

  it("redirects to home if user is not admin", async () => {
    const mockCookies = {
      get: vi.fn().mockReturnValue({ value: "user-123" }),
    }
    vi.mocked(cookies).mockResolvedValue(mockCookies as any)

    const mockUser = {
      id: "user-123",
      isAdmin: false,
      toPrimitives: () => ({
        id: "user-123",
        name: "Test User",
      }),
    }

    const mockUserRepository = {
      findById: vi.fn().mockResolvedValue(mockUser),
    }

    vi.mocked(container.getUserRepository).mockReturnValue(
      mockUserRepository as any
    )

    // Mock redirect to throw an error to stop execution
    vi.mocked(redirect).mockImplementation(() => {
      throw new Error("REDIRECT")
    })

    try {
      await AdminNewsletterPage()
    } catch (error: any) {
      expect(error.message).toBe("REDIRECT")
    }

    expect(redirect).toHaveBeenCalledWith("/")
  })

  it("renders newsletter admin page for admin users", async () => {
    const mockCookies = {
      get: vi.fn().mockReturnValue({ value: "admin-123" }),
    }
    vi.mocked(cookies).mockResolvedValue(mockCookies as any)

    const mockUser = {
      id: "admin-123",
      isAdmin: true,
      toPrimitives: () => ({
        id: "admin-123",
        name: "Admin User",
        email: "admin@example.com",
      }),
    }

    const mockUserRepository = {
      findById: vi.fn().mockResolvedValue(mockUser),
    }

    const mockNewsletterRepository = {
      findAll: vi.fn().mockResolvedValue([]),
    }

    const mockAnnouncementRepository = {
      findPending: vi.fn().mockResolvedValue([]),
    }

    const mockSubscriptionRepository = {
      countActive: vi.fn().mockResolvedValue(42),
    }

    vi.mocked(container.getUserRepository).mockReturnValue(
      mockUserRepository as any
    )
    vi.mocked(container.getNewsletterRepository).mockReturnValue(
      mockNewsletterRepository as any
    )
    vi.mocked(container.getAnnouncementRepository).mockReturnValue(
      mockAnnouncementRepository as any
    )
    vi.mocked(container.getSubscriptionRepository).mockReturnValue(
      mockSubscriptionRepository as any
    )

    const result = await AdminNewsletterPage()

    expect(redirect).not.toHaveBeenCalled()
    expect(mockNewsletterRepository.findAll).toHaveBeenCalled()
    expect(mockAnnouncementRepository.findPending).toHaveBeenCalled()
    expect(mockSubscriptionRepository.countActive).toHaveBeenCalled()
    expect(result).toBeDefined()
  })
})
