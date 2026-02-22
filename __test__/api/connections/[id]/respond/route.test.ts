import { describe, it, expect, vi, beforeEach } from "vitest"
import { POST } from "@/app/api/connections/[id]/respond/route"
import { NextRequest, NextResponse } from "next/server"

vi.mock("@/infrastructure/auth/middleware", () => ({
  requireAuth: vi.fn(),
  requireVerified: vi.fn(),
  requireProfile: vi.fn(),
  requireAdmin: vi.fn(),
  getAuthUser: vi.fn(),
}))

vi.mock("@/infrastructure/di/container", () => ({
  container: {
    getConnectionRepository: vi.fn(),
  },
}))

import { requireAuth } from "@/infrastructure/auth/middleware"
import { container } from "@/infrastructure/di/container"

const mockProfile = {
  id: "profile-id",
  email: "user@test.com",
  name: "Test User",
  graduationClass: 2020,
  isVerified: true,
  isAdmin: false,
  alumniId: null,
}

const makeBasicAuth = (profile = mockProfile) => ({
  success: true as const,
  auth: {
    user: { id: "user-id", email: "user@test.com" },
    profile,
  },
})

const makeAuthFail = (status: number, message: string) => ({
  success: false as const,
  response: NextResponse.json({ success: false, message }, { status }),
})

const makePendingConnection = (overrides = {}) => ({
  requesterId: "requester-id",
  receiverId: "profile-id",
  status: "pending",
  isPending: true,
  accept: vi.fn(),
  reject: vi.fn(),
  toPrimitives: vi.fn().mockReturnValue({
    id: "conn-id",
    requesterId: "requester-id",
    receiverId: "profile-id",
    message: null,
    status: "pending",
    respondedAt: null,
    createdAt: new Date().toISOString(),
  }),
  ...overrides,
})

const makeParams = (id: string) =>
  ({ params: Promise.resolve({ id }) }) as { params: Promise<{ id: string }> }

describe("/api/connections/[id]/respond POST", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("should return 401 if not authenticated", async () => {
    vi.mocked(requireAuth).mockResolvedValue(
      makeAuthFail(401, "로그인이 필요합니다.")
    )

    const request = new NextRequest(
      "http://localhost/api/connections/conn-id/respond",
      {
        method: "POST",
        body: JSON.stringify({ action: "accept" }),
      }
    )
    const response = await POST(request, makeParams("conn-id"))
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.success).toBe(false)
  })

  it("should return 404 if profile not found", async () => {
    vi.mocked(requireAuth).mockResolvedValue(makeBasicAuth(null as never))

    const request = new NextRequest(
      "http://localhost/api/connections/conn-id/respond",
      {
        method: "POST",
        body: JSON.stringify({ action: "accept" }),
      }
    )
    const response = await POST(request, makeParams("conn-id"))
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data.message).toBe("Profile not found.")
  })

  it("should return 400 for invalid action", async () => {
    vi.mocked(requireAuth).mockResolvedValue(makeBasicAuth())

    const request = new NextRequest(
      "http://localhost/api/connections/conn-id/respond",
      {
        method: "POST",
        body: JSON.stringify({ action: "invalid" }),
      }
    )
    const response = await POST(request, makeParams("conn-id"))
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
    expect(data.message).toBe("Invalid action. Must be 'accept' or 'reject'.")
  })

  it("should return 404 if connection not found", async () => {
    vi.mocked(requireAuth).mockResolvedValue(makeBasicAuth())

    const mockConnectionRepo = { findById: vi.fn().mockResolvedValue(null) }
    vi.mocked(container.getConnectionRepository).mockReturnValue(
      mockConnectionRepo as never
    )

    const request = new NextRequest(
      "http://localhost/api/connections/conn-id/respond",
      {
        method: "POST",
        body: JSON.stringify({ action: "accept" }),
      }
    )
    const response = await POST(request, makeParams("conn-id"))
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data.message).toBe("Connection not found.")
  })

  it("should return 403 if user is not the receiver", async () => {
    vi.mocked(requireAuth).mockResolvedValue(makeBasicAuth())

    const mockConnection = makePendingConnection({
      receiverId: "someone-else",
    })
    const mockConnectionRepo = {
      findById: vi.fn().mockResolvedValue(mockConnection),
    }
    vi.mocked(container.getConnectionRepository).mockReturnValue(
      mockConnectionRepo as never
    )

    const request = new NextRequest(
      "http://localhost/api/connections/conn-id/respond",
      {
        method: "POST",
        body: JSON.stringify({ action: "accept" }),
      }
    )
    const response = await POST(request, makeParams("conn-id"))
    const data = await response.json()

    expect(response.status).toBe(403)
    expect(data.message).toBe(
      "Only the receiver can respond to this connection request."
    )
  })

  it("should return 400 if connection is not pending", async () => {
    vi.mocked(requireAuth).mockResolvedValue(makeBasicAuth())

    const mockConnection = makePendingConnection({ isPending: false })
    const mockConnectionRepo = {
      findById: vi.fn().mockResolvedValue(mockConnection),
    }
    vi.mocked(container.getConnectionRepository).mockReturnValue(
      mockConnectionRepo as never
    )

    const request = new NextRequest(
      "http://localhost/api/connections/conn-id/respond",
      {
        method: "POST",
        body: JSON.stringify({ action: "accept" }),
      }
    )
    const response = await POST(request, makeParams("conn-id"))
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.message).toBe(
      "This connection request has already been responded to."
    )
  })

  it("should accept connection and return 200", async () => {
    vi.mocked(requireAuth).mockResolvedValue(makeBasicAuth())

    const mockConnection = makePendingConnection()
    const mockConnectionRepo = {
      findById: vi.fn().mockResolvedValue(mockConnection),
      save: vi.fn().mockResolvedValue(undefined),
    }
    vi.mocked(container.getConnectionRepository).mockReturnValue(
      mockConnectionRepo as never
    )

    const request = new NextRequest(
      "http://localhost/api/connections/conn-id/respond",
      {
        method: "POST",
        body: JSON.stringify({ action: "accept" }),
      }
    )
    const response = await POST(request, makeParams("conn-id"))
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(mockConnection.accept).toHaveBeenCalled()
    expect(mockConnectionRepo.save).toHaveBeenCalled()
  })

  it("should reject connection and return 200", async () => {
    vi.mocked(requireAuth).mockResolvedValue(makeBasicAuth())

    const mockConnection = makePendingConnection()
    const mockConnectionRepo = {
      findById: vi.fn().mockResolvedValue(mockConnection),
      save: vi.fn().mockResolvedValue(undefined),
    }
    vi.mocked(container.getConnectionRepository).mockReturnValue(
      mockConnectionRepo as never
    )

    const request = new NextRequest(
      "http://localhost/api/connections/conn-id/respond",
      {
        method: "POST",
        body: JSON.stringify({ action: "reject" }),
      }
    )
    const response = await POST(request, makeParams("conn-id"))
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(mockConnection.reject).toHaveBeenCalled()
    expect(mockConnectionRepo.save).toHaveBeenCalled()
  })

  it("should return 500 on repository error", async () => {
    vi.mocked(requireAuth).mockResolvedValue(makeBasicAuth())

    vi.mocked(container.getConnectionRepository).mockImplementation(() => {
      throw new Error("DB error")
    })

    const request = new NextRequest(
      "http://localhost/api/connections/conn-id/respond",
      {
        method: "POST",
        body: JSON.stringify({ action: "accept" }),
      }
    )
    const response = await POST(request, makeParams("conn-id"))
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.success).toBe(false)
  })
})
