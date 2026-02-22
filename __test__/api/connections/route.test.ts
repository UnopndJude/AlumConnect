import { describe, it, expect, vi, beforeEach } from "vitest"
import { GET, POST } from "@/app/api/connections/route"
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
    getProfileRepository: vi.fn(),
  },
}))

import { requireAuth, requireVerified } from "@/infrastructure/auth/middleware"
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

const makeVerifiedAuth = () => ({
  success: true as const,
  auth: {
    user: { id: "user-id", email: "user@test.com" },
    profile: mockProfile,
  },
})

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

describe("/api/connections POST", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("should return 401 if not authenticated", async () => {
    vi.mocked(requireVerified).mockResolvedValue(
      makeAuthFail(401, "로그인이 필요합니다.")
    )

    const request = new NextRequest("http://localhost/api/connections", {
      method: "POST",
      body: JSON.stringify({ receiverId: "receiver-id" }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.success).toBe(false)
  })

  it("should return 403 if not verified", async () => {
    vi.mocked(requireVerified).mockResolvedValue(
      makeAuthFail(403, "인증된 동문만 이용 가능합니다.")
    )

    const request = new NextRequest("http://localhost/api/connections", {
      method: "POST",
      body: JSON.stringify({ receiverId: "receiver-id" }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(403)
    expect(data.success).toBe(false)
  })

  it("should return 400 if receiverId is missing", async () => {
    vi.mocked(requireVerified).mockResolvedValue(makeVerifiedAuth())

    const request = new NextRequest("http://localhost/api/connections", {
      method: "POST",
      body: JSON.stringify({}),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
    expect(data.message).toBe("receiverId is required.")
  })

  it("should return 400 if sending to self", async () => {
    vi.mocked(requireVerified).mockResolvedValue(makeVerifiedAuth())

    const request = new NextRequest("http://localhost/api/connections", {
      method: "POST",
      body: JSON.stringify({ receiverId: "profile-id" }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
    expect(data.message).toBe("Cannot send connection request to yourself.")
  })

  it("should return 404 if receiver not found", async () => {
    vi.mocked(requireVerified).mockResolvedValue(makeVerifiedAuth())

    const mockProfileRepo = { findById: vi.fn().mockResolvedValue(null) }
    const mockConnectionRepo = {
      findBetweenUsers: vi.fn().mockResolvedValue(null),
      save: vi.fn().mockResolvedValue(undefined),
    }

    vi.mocked(container.getProfileRepository).mockReturnValue(
      mockProfileRepo as never
    )
    vi.mocked(container.getConnectionRepository).mockReturnValue(
      mockConnectionRepo as never
    )

    const request = new NextRequest("http://localhost/api/connections", {
      method: "POST",
      body: JSON.stringify({ receiverId: "receiver-id" }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data.success).toBe(false)
    expect(data.message).toBe("Receiver not found.")
  })

  it("should return 409 if connection already exists", async () => {
    vi.mocked(requireVerified).mockResolvedValue(makeVerifiedAuth())

    const mockProfileRepo = {
      findById: vi.fn().mockResolvedValue({ id: "receiver-id" }),
    }
    const mockConnectionRepo = {
      findBetweenUsers: vi.fn().mockResolvedValue(makeMockConnection()),
      save: vi.fn().mockResolvedValue(undefined),
    }

    vi.mocked(container.getProfileRepository).mockReturnValue(
      mockProfileRepo as never
    )
    vi.mocked(container.getConnectionRepository).mockReturnValue(
      mockConnectionRepo as never
    )

    const request = new NextRequest("http://localhost/api/connections", {
      method: "POST",
      body: JSON.stringify({ receiverId: "receiver-id" }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(409)
    expect(data.success).toBe(false)
    expect(data.message).toBe("Connection already exists between these users.")
  })

  it("should create connection and return 200", async () => {
    vi.mocked(requireVerified).mockResolvedValue(makeVerifiedAuth())

    const mockProfileRepo = {
      findById: vi.fn().mockResolvedValue({ id: "receiver-id" }),
    }
    const mockConnectionRepo = {
      findBetweenUsers: vi.fn().mockResolvedValue(null),
      save: vi.fn().mockResolvedValue(undefined),
    }

    vi.mocked(container.getProfileRepository).mockReturnValue(
      mockProfileRepo as never
    )
    vi.mocked(container.getConnectionRepository).mockReturnValue(
      mockConnectionRepo as never
    )

    const request = new NextRequest("http://localhost/api/connections", {
      method: "POST",
      body: JSON.stringify({ receiverId: "receiver-id", message: "Hello!" }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.data).toBeDefined()
    expect(mockConnectionRepo.save).toHaveBeenCalled()
  })

  it("should return 500 on repository error", async () => {
    vi.mocked(requireVerified).mockResolvedValue(makeVerifiedAuth())

    vi.mocked(container.getConnectionRepository).mockImplementation(() => {
      throw new Error("Repository unavailable")
    })
    vi.mocked(container.getProfileRepository).mockReturnValue({
      findById: vi.fn().mockResolvedValue({ id: "receiver-id" }),
    } as never)

    const request = new NextRequest("http://localhost/api/connections", {
      method: "POST",
      body: JSON.stringify({ receiverId: "receiver-id" }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.success).toBe(false)
  })
})

describe("/api/connections GET", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("should return 401 if not authenticated", async () => {
    vi.mocked(requireAuth).mockResolvedValue(
      makeAuthFail(401, "로그인이 필요합니다.")
    )

    const request = new NextRequest("http://localhost/api/connections")
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.success).toBe(false)
  })

  it("should return 404 if profile not found", async () => {
    vi.mocked(requireAuth).mockResolvedValue(makeBasicAuth(null as never))

    const request = new NextRequest("http://localhost/api/connections")
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data.success).toBe(false)
    expect(data.message).toBe("Profile not found.")
  })

  it("should return pending connections when status=pending", async () => {
    vi.mocked(requireAuth).mockResolvedValue(makeBasicAuth())

    const mockConn = makeMockConnection()
    const mockConnectionRepo = {
      findPendingForUser: vi.fn().mockResolvedValue([mockConn]),
    }
    vi.mocked(container.getConnectionRepository).mockReturnValue(
      mockConnectionRepo as never
    )

    const request = new NextRequest(
      "http://localhost/api/connections?status=pending"
    )
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.data).toHaveLength(1)
    expect(mockConnectionRepo.findPendingForUser).toHaveBeenCalledWith(
      "profile-id"
    )
  })

  it("should return accepted connections when status=accepted", async () => {
    vi.mocked(requireAuth).mockResolvedValue(makeBasicAuth())

    const mockConn = makeMockConnection({
      status: "accepted",
      isPending: false,
      isAccepted: true,
    })
    const mockConnectionRepo = {
      findAcceptedConnections: vi.fn().mockResolvedValue([mockConn]),
    }
    vi.mocked(container.getConnectionRepository).mockReturnValue(
      mockConnectionRepo as never
    )

    const request = new NextRequest(
      "http://localhost/api/connections?status=accepted"
    )
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(mockConnectionRepo.findAcceptedConnections).toHaveBeenCalledWith(
      "profile-id"
    )
  })

  it("should return rejected connections when status=rejected", async () => {
    vi.mocked(requireAuth).mockResolvedValue(makeBasicAuth())

    const mockConn = makeMockConnection({
      status: "rejected",
      isPending: false,
    })
    const mockConnectionRepo = {
      findByReceiverId: vi.fn().mockResolvedValue([mockConn]),
    }
    vi.mocked(container.getConnectionRepository).mockReturnValue(
      mockConnectionRepo as never
    )

    const request = new NextRequest(
      "http://localhost/api/connections?status=rejected"
    )
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(mockConnectionRepo.findByReceiverId).toHaveBeenCalledWith(
      "profile-id"
    )
  })

  it("should return all connections when no status filter", async () => {
    vi.mocked(requireAuth).mockResolvedValue(makeBasicAuth())

    const mockSent = makeMockConnection()
    const mockReceived = makeMockConnection({
      receiverId: "profile-id",
      requesterId: "other-id",
    })
    const mockConnectionRepo = {
      findByRequesterId: vi.fn().mockResolvedValue([mockSent]),
      findByReceiverId: vi.fn().mockResolvedValue([mockReceived]),
    }
    vi.mocked(container.getConnectionRepository).mockReturnValue(
      mockConnectionRepo as never
    )

    const request = new NextRequest("http://localhost/api/connections")
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.data).toHaveLength(2)
  })

  it("should return 500 on repository error", async () => {
    vi.mocked(requireAuth).mockResolvedValue(makeBasicAuth())

    vi.mocked(container.getConnectionRepository).mockImplementation(() => {
      throw new Error("DB error")
    })

    const request = new NextRequest("http://localhost/api/connections")
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.success).toBe(false)
  })
})
