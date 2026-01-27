import { describe, it, expect, beforeEach, vi } from "vitest"
import { GET, POST } from "@/app/api/introductions/route"
import { NextRequest } from "next/server"

// Mock the cookies function
vi.mock("next/headers", () => ({
  cookies: vi.fn(),
}))

// Mock the container
vi.mock("@/infrastructure/di/container", () => ({
  container: {
    getUserRepository: vi.fn(),
    getIntroductionRepository: vi.fn(),
  },
}))

// Mock the use cases
vi.mock("@/application/introduction/use-cases/IntroductionUseCases", () => ({
  CreateIntroductionUseCase: vi.fn().mockImplementation(() => ({
    execute: vi.fn(),
  })),
  GetIntroductionsUseCase: vi.fn().mockImplementation(() => ({
    execute: vi.fn(),
  })),
}))

import { cookies } from "next/headers"
import { container } from "@/infrastructure/di/container"
import {
  CreateIntroductionUseCase,
  GetIntroductionsUseCase,
} from "@/application/introduction/use-cases/IntroductionUseCases"

const mockCookies = vi.mocked(cookies)

// Mock user entity
const createMockUserEntity = (data: {
  id: string
  email: string
  name: string
  graduationClass: number
  status: string
  isAdmin: boolean
}) => ({
  status: {
    isApproved: () => data.status === "approved",
  },
  toPrimitives: () => ({
    id: data.id,
    email: data.email,
    name: data.name,
    graduationClass: data.graduationClass,
    status: data.status,
    isAdmin: data.isAdmin,
  }),
})

describe("/api/introductions - GET", () => {
  let mockGetExecute: ReturnType<typeof vi.fn>

  beforeEach(() => {
    vi.clearAllMocks()
    mockGetExecute = vi.fn()

    vi.mocked(GetIntroductionsUseCase).mockImplementation(
      () =>
        ({
          execute: mockGetExecute,
        }) as unknown as GetIntroductionsUseCase
    )
  })

  it("should return all introductions", async () => {
    const mockIntroductions = [
      {
        id: "intro-1",
        userId: "user-1",
        name: "홍길동",
        graduationClass: 10,
        status: "employed",
        field: "컴퓨터공학",
        organization: "삼성전자",
        selfIntroduction: "소프트웨어 엔지니어입니다.",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "intro-2",
        userId: "user-2",
        name: "김영희",
        graduationClass: 11,
        status: "graduate_student",
        field: "생명과학",
        organization: "서울대학교",
        selfIntroduction: "생명과학 연구를 하고 있습니다.",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]

    mockGetExecute.mockResolvedValue(mockIntroductions)

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.introductions).toHaveLength(2)
    expect(data.introductions[0].name).toBe("홍길동")
    expect(data.introductions[1].name).toBe("김영희")
  })

  it("should return empty array when no introductions exist", async () => {
    mockGetExecute.mockResolvedValue([])

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.introductions).toHaveLength(0)
  })

  it("should handle server errors", async () => {
    mockGetExecute.mockRejectedValue(new Error("Database error"))

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.success).toBe(false)
    expect(data.message).toBe("서버 오류가 발생했습니다.")
  })
})

describe("/api/introductions - POST", () => {
  let mockCreateExecute: ReturnType<typeof vi.fn>
  const mockUserRepository = {
    findById: vi.fn(),
  }
  const mockIntroductionRepository = {}

  const mockCookieStore = {
    get: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockCreateExecute = vi.fn()

    vi.mocked(container.getUserRepository).mockReturnValue(
      mockUserRepository as unknown as ReturnType<
        typeof container.getUserRepository
      >
    )
    vi.mocked(container.getIntroductionRepository).mockReturnValue(
      mockIntroductionRepository as unknown as ReturnType<
        typeof container.getIntroductionRepository
      >
    )
    vi.mocked(CreateIntroductionUseCase).mockImplementation(
      () =>
        ({
          execute: mockCreateExecute,
        }) as unknown as CreateIntroductionUseCase
    )
  })

  const createMockRequest = (body: Record<string, unknown>) => {
    return new NextRequest("http://localhost:3000/api/introductions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })
  }

  it("should create introduction successfully", async () => {
    const requestBody = {
      status: "employed",
      field: "컴퓨터공학",
      organization: "삼성전자",
      selfIntroduction: "소프트웨어 엔지니어입니다.",
      location: "서울",
      interests: "프로그래밍",
    }

    const mockUser = createMockUserEntity({
      id: "user-123",
      email: "test@example.com",
      name: "홍길동",
      graduationClass: 10,
      status: "approved",
      isAdmin: false,
    })

    const mockCreatedIntroduction = {
      id: "intro-123",
      userId: "user-123",
      name: "홍길동",
      graduationClass: 10,
      ...requestBody,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    mockCookies.mockResolvedValue(mockCookieStore as unknown as Awaited<ReturnType<typeof cookies>>)
    mockCookieStore.get.mockReturnValue({ value: "user-123" })
    mockUserRepository.findById.mockResolvedValue(mockUser)
    mockCreateExecute.mockResolvedValue({
      success: true,
      value: mockCreatedIntroduction,
    })

    const request = createMockRequest(requestBody)
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.message).toBe("자기소개가 등록되었습니다.")
    expect(data.introduction.id).toBe("intro-123")
  })

  it("should return error when user is not logged in", async () => {
    mockCookies.mockResolvedValue(mockCookieStore as unknown as Awaited<ReturnType<typeof cookies>>)
    mockCookieStore.get.mockReturnValue(undefined)

    const request = createMockRequest({})
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.success).toBe(false)
    expect(data.message).toBe("로그인이 필요합니다.")

    expect(mockUserRepository.findById).not.toHaveBeenCalled()
    expect(mockCreateExecute).not.toHaveBeenCalled()
  })

  it("should return error when user is not approved", async () => {
    const mockUser = createMockUserEntity({
      id: "user-123",
      email: "test@example.com",
      name: "홍길동",
      graduationClass: 10,
      status: "pending",
      isAdmin: false,
    })

    mockCookies.mockResolvedValue(mockCookieStore as unknown as Awaited<ReturnType<typeof cookies>>)
    mockCookieStore.get.mockReturnValue({ value: "user-123" })
    mockUserRepository.findById.mockResolvedValue(mockUser)

    const request = createMockRequest({})
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(403)
    expect(data.success).toBe(false)
    expect(data.message).toBe("승인된 회원만 자기소개를 작성할 수 있습니다.")

    expect(mockCreateExecute).not.toHaveBeenCalled()
  })

  it("should return error when user already has introduction", async () => {
    const mockUser = createMockUserEntity({
      id: "user-123",
      email: "test@example.com",
      name: "홍길동",
      graduationClass: 10,
      status: "approved",
      isAdmin: false,
    })

    const requestBody = {
      status: "employed",
      selfIntroduction: "소프트웨어 엔지니어입니다.",
    }

    mockCookies.mockResolvedValue(mockCookieStore as unknown as Awaited<ReturnType<typeof cookies>>)
    mockCookieStore.get.mockReturnValue({ value: "user-123" })
    mockUserRepository.findById.mockResolvedValue(mockUser)
    mockCreateExecute.mockResolvedValue({
      success: false,
      error: {
        message:
          "이미 자기소개를 작성하셨습니다. 수정을 원하시면 수정 버튼을 이용해주세요.",
      },
    })

    const request = createMockRequest(requestBody)
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(409)
    expect(data.success).toBe(false)
    expect(data.message).toBe(
      "이미 자기소개를 작성하셨습니다. 수정을 원하시면 수정 버튼을 이용해주세요."
    )
  })

  it("should return error when required fields are missing", async () => {
    const mockUser = createMockUserEntity({
      id: "user-123",
      email: "test@example.com",
      name: "홍길동",
      graduationClass: 10,
      status: "approved",
      isAdmin: false,
    })

    const requestBody = {
      status: "employed",
      // selfIntroduction 누락
    }

    mockCookies.mockResolvedValue(mockCookieStore as unknown as Awaited<ReturnType<typeof cookies>>)
    mockCookieStore.get.mockReturnValue({ value: "user-123" })
    mockUserRepository.findById.mockResolvedValue(mockUser)

    const request = createMockRequest(requestBody)
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
    expect(data.message).toBe("필수 정보를 모두 입력해주세요.")

    expect(mockCreateExecute).not.toHaveBeenCalled()
  })

  it("should handle server errors", async () => {
    const mockUser = createMockUserEntity({
      id: "user-123",
      email: "test@example.com",
      name: "홍길동",
      graduationClass: 10,
      status: "approved",
      isAdmin: false,
    })

    const requestBody = {
      status: "employed",
      selfIntroduction: "소프트웨어 엔지니어입니다.",
    }

    mockCookies.mockResolvedValue(mockCookieStore as unknown as Awaited<ReturnType<typeof cookies>>)
    mockCookieStore.get.mockReturnValue({ value: "user-123" })
    mockUserRepository.findById.mockResolvedValue(mockUser)
    mockCreateExecute.mockRejectedValue(new Error("Database error"))

    const request = createMockRequest(requestBody)
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.success).toBe(false)
    expect(data.message).toBe("서버 오류가 발생했습니다.")
  })

  it("should return error when user is not found", async () => {
    mockCookies.mockResolvedValue(mockCookieStore as unknown as Awaited<ReturnType<typeof cookies>>)
    mockCookieStore.get.mockReturnValue({ value: "user-123" })
    mockUserRepository.findById.mockResolvedValue(null)

    const request = createMockRequest({})
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data.success).toBe(false)
    expect(data.message).toBe("사용자를 찾을 수 없습니다.")
  })
})
