import { describe, it, expect, vi, beforeEach } from "vitest"
import { GET, DELETE } from "@/app/api/connections/[id]/route"
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

const makeMockConnection = (overrides = {}) => ({
  requesterId: "profile-id",
  receiverId: "receiver-id",
  status: "pending",
  isPending: true,
  isAccepted: false,
  accept: vi.fn(),
  reject: vi.fn(),
  toPrimitives: vi.fn().mockReturnValue({
    id: "conn-id",
    requesterId: "profile-id",
    receiverId: "receiver-id",
    message: null,
    status: "pending",
    respondedAt: null,
    createdAt: new Date().toISOString(),
  }),
  ...overrides,
})

const makeParams = (id: string) =>
  ({ params: Promise.resolve({ id }) }) as { params: Promise<{ id: string }> }

describe("/api/connections/[id] GET", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("should return 401 if not authenticated", async () => {
    vi.mocked(requireAuth).mockResolvedValue(
      makeAuthFail(401, "로그인이 필요합니다.")
    )

    const request = new NextRequest("http://localhost/api/connections/conn-id")
    const response = await GET(request, makeParams("conn-id"))
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.success).toBe(false)
  })

  it("should return 404 if profile not found", async () => {
    vi.mocked(requireAuth).mockResolvedValue(makeBasicAuth(null as never))

    const request = new NextRequest("http://localhost/api/connections/conn-id")
    const response = await GET(request, makeParams("conn-id"))
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data.message).toBe("Profile not found.")
  })

  it("should return 404 if connection not found", async () => {
    vi.mocked(requireAuth).mockResolvedValue(makeBasicAuth())

    const mockConnectionRepo = { findById: vi.fn().mockResolvedValue(null) }
    vi.mocked(container.getConnectionRepository).mockReturnValue(
      mockConnectionRepo as never
    )

    const request = new NextRequest("http://localhost/api/connections/conn-id")
    const response = await GET(request, makeParams("conn-id"))
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data.message).toBe("Connection not found.")
  })

  it("should return 403 if user is not a party to the connection", async () => {
    vi.mocked(requireAuth).mockResolvedValue(makeBasicAuth())

    const mockConnection = makeMockConnection({
      requesterId: "other-user",
      receiverId: "another-user",
    })
    const mockConnectionRepo = {
      findById: vi.fn().mockResolvedValue(mockConnection),
    }
    vi.mocked(container.getConnectionRepository).mockReturnValue(
      mockConnectionRepo as never
    )

    const request = new NextRequest("http://localhost/api/connections/conn-id")
    const response = await GET(request, makeParams("conn-id"))
    const data = await response.json()

    expect(response.status).toBe(403)
    expect(data.message).toBe("Unauthorized.")
  })

  it("should return 200 when user is the requester", async () => {
    vi.mocked(requireAuth).mockResolvedValue(makeBasicAuth())

    const mockConnection = makeMockConnection()
    const mockConnectionRepo = {
      findById: vi.fn().mockResolvedValue(mockConnection),
    }
    vi.mocked(container.getConnectionRepository).mockReturnValue(
      mockConnectionRepo as never
    )

    const request = new NextRequest("http://localhost/api/connections/conn-id")
    const response = await GET(request, makeParams("conn-id"))
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.data).toBeDefined()
  })

  it("should return 200 when user is the receiver", async () => {
    vi.mocked(requireAuth).mockResolvedValue(makeBasicAuth())

    const mockConnection = makeMockConnection({
      requesterId: "other-user",
      receiverId: "profile-id",
    })
    const mockConnectionRepo = {
      findById: vi.fn().mockResolvedValue(mockConnection),
    }
    vi.mocked(container.getConnectionRepository).mockReturnValue(
      mockConnectionRepo as never
    )

    const request = new NextRequest("http://localhost/api/connections/conn-id")
    const response = await GET(request, makeParams("conn-id"))
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
  })

  it("should return 500 on repository error", async () => {
    vi.mocked(requireAuth).mockResolvedValue(makeBasicAuth())

    vi.mocked(container.getConnectionRepository).mockImplementation(() => {
      throw new Error("DB error")
    })

    const request = new NextRequest("http://localhost/api/connections/conn-id")
    const response = await GET(request, makeParams("conn-id"))
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.success).toBe(false)
  })
})

describe("/api/connections/[id] DELETE", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("should return 401 if not authenticated", async () => {
    vi.mocked(requireAuth).mockResolvedValue(
      makeAuthFail(401, "로그인이 필요합니다.")
    )

    const request = new NextRequest(
      "http://localhost/api/connections/conn-id",
      {
        method: "DELETE",
      }
    )
    const response = await DELETE(request, makeParams("conn-id"))
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.success).toBe(false)
  })

  it("should return 404 if profile not found", async () => {
    vi.mocked(requireAuth).mockResolvedValue(makeBasicAuth(null as never))

    const request = new NextRequest(
      "http://localhost/api/connections/conn-id",
      {
        method: "DELETE",
      }
    )
    const response = await DELETE(request, makeParams("conn-id"))
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data.message).toBe("Profile not found.")
  })

  it("should return 404 if connection not found", async () => {
    vi.mocked(requireAuth).mockResolvedValue(makeBasicAuth())

    const mockConnectionRepo = { findById: vi.fn().mockResolvedValue(null) }
    vi.mocked(container.getConnectionRepository).mockReturnValue(
      mockConnectionRepo as never
    )

    const request = new NextRequest(
      "http://localhost/api/connections/conn-id",
      {
        method: "DELETE",
      }
    )
    const response = await DELETE(request, makeParams("conn-id"))
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data.message).toBe("Connection not found.")
  })

  it("should allow requester to cancel pending connection", async () => {
    vi.mocked(requireAuth).mockResolvedValue(makeBasicAuth())

    const mockConnection = makeMockConnection({
      requesterId: "profile-id",
      isPending: true,
    })
    const mockConnectionRepo = {
      findById: vi.fn().mockResolvedValue(mockConnection),
      delete: vi.fn().mockResolvedValue(undefined),
    }
    vi.mocked(container.getConnectionRepository).mockReturnValue(
      mockConnectionRepo as never
    )

    const request = new NextRequest(
      "http://localhost/api/connections/conn-id",
      {
        method: "DELETE",
      }
    )
    const response = await DELETE(request, makeParams("conn-id"))
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.message).toBe("Connection request cancelled.")
    expect(mockConnectionRepo.delete).toHaveBeenCalledWith("conn-id")
  })

  it("should allow requester to remove accepted connection", async () => {
    vi.mocked(requireAuth).mockResolvedValue(makeBasicAuth())

    const mockConnection = makeMockConnection({
      requesterId: "profile-id",
      isPending: false,
      isAccepted: true,
    })
    const mockConnectionRepo = {
      findById: vi.fn().mockResolvedValue(mockConnection),
      delete: vi.fn().mockResolvedValue(undefined),
    }
    vi.mocked(container.getConnectionRepository).mockReturnValue(
      mockConnectionRepo as never
    )

    const request = new NextRequest(
      "http://localhost/api/connections/conn-id",
      {
        method: "DELETE",
      }
    )
    const response = await DELETE(request, makeParams("conn-id"))
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.message).toBe("Connection removed.")
  })

  it("should allow receiver to remove accepted connection", async () => {
    vi.mocked(requireAuth).mockResolvedValue(makeBasicAuth())

    const mockConnection = makeMockConnection({
      requesterId: "other-user",
      receiverId: "profile-id",
      isPending: false,
      isAccepted: true,
    })
    const mockConnectionRepo = {
      findById: vi.fn().mockResolvedValue(mockConnection),
      delete: vi.fn().mockResolvedValue(undefined),
    }
    vi.mocked(container.getConnectionRepository).mockReturnValue(
      mockConnectionRepo as never
    )

    const request = new NextRequest(
      "http://localhost/api/connections/conn-id",
      {
        method: "DELETE",
      }
    )
    const response = await DELETE(request, makeParams("conn-id"))
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
  })

  it("should return 403 when user is unauthorized to delete", async () => {
    vi.mocked(requireAuth).mockResolvedValue(makeBasicAuth())

    const mockConnection = makeMockConnection({
      requesterId: "other-user",
      receiverId: "another-user",
      isPending: false,
      isAccepted: false,
    })
    const mockConnectionRepo = {
      findById: vi.fn().mockResolvedValue(mockConnection),
      delete: vi.fn(),
    }
    vi.mocked(container.getConnectionRepository).mockReturnValue(
      mockConnectionRepo as never
    )

    const request = new NextRequest(
      "http://localhost/api/connections/conn-id",
      {
        method: "DELETE",
      }
    )
    const response = await DELETE(request, makeParams("conn-id"))
    const data = await response.json()

    expect(response.status).toBe(403)
    expect(data.message).toBe("Unauthorized to delete this connection.")
  })

  it("should return 500 on repository error", async () => {
    vi.mocked(requireAuth).mockResolvedValue(makeBasicAuth())

    vi.mocked(container.getConnectionRepository).mockImplementation(() => {
      throw new Error("DB error")
    })

    const request = new NextRequest(
      "http://localhost/api/connections/conn-id",
      {
        method: "DELETE",
      }
    )
    const response = await DELETE(request, makeParams("conn-id"))
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.success).toBe(false)
  })
})
