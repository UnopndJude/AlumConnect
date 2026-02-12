import { describe, it, expect, beforeEach, vi } from "vitest"
import { POST } from "@/app/api/auth/register/route"
import { NextRequest } from "next/server"

// Mock the container
vi.mock("@/infrastructure/di/container", () => ({
  container: {
    getUserRepository: vi.fn(),
    getPasswordHasher: vi.fn(),
  },
}))

// Mock the RegisterUserUseCase
vi.mock("@/application/user/use-cases/RegisterUser", () => ({
  RegisterUserUseCase: vi.fn().mockImplementation(() => ({
    execute: vi.fn(),
  })),
}))

import { container } from "@/infrastructure/di/container"
import { RegisterUserUseCase } from "@/application/user/use-cases/RegisterUser"

const mockUserRepository = {}
const mockPasswordHasher = {}

describe("/api/auth/register", () => {
  let mockExecute: ReturnType<typeof vi.fn>

  beforeEach(() => {
    vi.clearAllMocks()
    mockExecute = vi.fn()

    vi.mocked(container.getUserRepository).mockReturnValue(
      mockUserRepository as ReturnType<typeof container.getUserRepository>
    )
    vi.mocked(container.getPasswordHasher).mockReturnValue(
      mockPasswordHasher as ReturnType<typeof container.getPasswordHasher>
    )
    vi.mocked(RegisterUserUseCase).mockImplementation(
      () =>
        ({
          execute: mockExecute,
        }) as unknown as RegisterUserUseCase
    )
  })

  const createMockRequest = (body: Record<string, unknown>) => {
    return new NextRequest("http://localhost:3000/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })
  }

  it("should register a new user successfully", async () => {
    const requestBody = {
      email: "test@example.com",
      password: "password123",
      name: "홍길동",
      graduationClass: 10,
    }

    mockExecute.mockResolvedValue({
      success: true,
      value: {
        user: {
          id: "user-123",
          email: "test@example.com",
          name: "홍길동",
          graduationClass: 10,
          status: "pending",
        },
      },
    })

    const request = createMockRequest(requestBody)
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.message).toBe(
      "회원가입이 완료되었습니다. 관리자의 승인을 기다려주세요."
    )
    expect(data.user).toEqual({
      id: "user-123",
      email: "test@example.com",
      name: "홍길동",
      graduationClass: 10,
      status: "pending",
    })

    expect(mockExecute).toHaveBeenCalledWith(
      {
        email: "test@example.com",
        password: "password123",
        name: "홍길동",
        graduationClass: 10,
      },
      { autoApprove: false }
    )
  })

  it("should return error when required fields are missing", async () => {
    const requestBody = {
      email: "test@example.com",
      // password 누락
      name: "홍길동",
      graduationClass: 10,
    }

    const request = createMockRequest(requestBody)
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
    expect(data.message).toBe("모든 필드를 입력해주세요.")

    expect(mockExecute).not.toHaveBeenCalled()
  })

  it("should return error when graduation class is out of range", async () => {
    const requestBody = {
      email: "test@example.com",
      password: "password123",
      name: "홍길동",
      graduationClass: 100, // 범위 초과
    }

    const request = createMockRequest(requestBody)
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
    expect(data.message).toBe("기수는 1기부터 50기까지 입력 가능합니다.")

    expect(mockExecute).not.toHaveBeenCalled()
  })

  it("should return error when user already exists", async () => {
    const requestBody = {
      email: "existing@example.com",
      password: "password123",
      name: "홍길동",
      graduationClass: 10,
    }

    mockExecute.mockResolvedValue({
      success: false,
      error: { message: "이미 등록된 이메일입니다." },
    })

    const request = createMockRequest(requestBody)
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(409)
    expect(data.success).toBe(false)
    expect(data.message).toBe("이미 등록된 이메일입니다.")
  })

  it("should handle invalid JSON gracefully", async () => {
    const request = new NextRequest("http://localhost:3000/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: "invalid json",
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.success).toBe(false)
    expect(data.message).toBe("서버 오류가 발생했습니다.")
  })

  it("should validate graduation class minimum value", async () => {
    const requestBody = {
      email: "test@example.com",
      password: "password123",
      name: "홍길동",
      graduationClass: -1, // 최소값 미만 (0 is falsy, so use -1)
    }

    const request = createMockRequest(requestBody)
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
    expect(data.message).toBe("기수는 1기부터 50기까지 입력 가능합니다.")
  })

  it("should handle empty request body", async () => {
    const request = createMockRequest({})
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
    expect(data.message).toBe("모든 필드를 입력해주세요.")
  })

  it("should handle use case returning other errors", async () => {
    const requestBody = {
      email: "test@example.com",
      password: "password123",
      name: "홍길동",
      graduationClass: 10,
    }

    mockExecute.mockResolvedValue({
      success: false,
      error: { message: "유효하지 않은 이메일 형식입니다." },
    })

    const request = createMockRequest(requestBody)
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
    expect(data.message).toBe("유효하지 않은 이메일 형식입니다.")
  })
})
