import { describe, it, expect, beforeEach, vi } from "vitest"
import { User } from "@/types/user"

// Mock the container
vi.mock("@/infrastructure/di/container", () => ({
  container: {
    getUserRepository: vi.fn(),
  },
}))

import { container } from "@/infrastructure/di/container"
import {
  getUserByEmail,
  getUserById,
  getPendingUsers,
  getAllUsers,
} from "@/lib/database"

const mockUserRepository = {
  findByEmailString: vi.fn(),
  findById: vi.fn(),
  findPending: vi.fn(),
  findAll: vi.fn(),
}

// Mock user entity
const createMockUserEntity = (userData: Partial<User>) => ({
  toPrimitives: () => ({
    id: userData.id || "user-123",
    email: userData.email || "test@example.com",
    password: userData.password || "password123",
    name: userData.name || "홍길동",
    graduationClass: userData.graduationClass || 10,
    status: userData.status || "pending",
    isAdmin: userData.isAdmin || false,
    createdAt: userData.createdAt || new Date(),
  }),
})

describe("Database Operations", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(container.getUserRepository).mockReturnValue(
      mockUserRepository as ReturnType<typeof container.getUserRepository>
    )
  })

  describe("getUserByEmail", () => {
    it("should return user when email exists", async () => {
      const mockUser = createMockUserEntity({
        email: "test@example.com",
        name: "홍길동",
      })

      mockUserRepository.findByEmailString.mockResolvedValue(mockUser)

      const foundUser = await getUserByEmail("test@example.com")

      expect(foundUser).toBeDefined()
      expect(foundUser?.email).toBe("test@example.com")
      expect(foundUser?.name).toBe("홍길동")
      expect(mockUserRepository.findByEmailString).toHaveBeenCalledWith(
        "test@example.com"
      )
    })

    it("should return undefined when email does not exist", async () => {
      mockUserRepository.findByEmailString.mockResolvedValue(null)

      const foundUser = await getUserByEmail("nonexistent@example.com")

      expect(foundUser).toBeUndefined()
    })
  })

  describe("getUserById", () => {
    it("should return user when ID exists", async () => {
      const mockUser = createMockUserEntity({
        id: "user-123",
        email: "test@example.com",
      })

      mockUserRepository.findById.mockResolvedValue(mockUser)

      const foundUser = await getUserById("user-123")

      expect(foundUser).toBeDefined()
      expect(foundUser?.id).toBe("user-123")
      expect(foundUser?.email).toBe("test@example.com")
    })

    it("should return undefined when ID does not exist", async () => {
      mockUserRepository.findById.mockResolvedValue(null)

      const foundUser = await getUserById("nonexistent-id")

      expect(foundUser).toBeUndefined()
    })
  })

  describe("getPendingUsers", () => {
    it("should return only users with pending status", async () => {
      const pendingUsers = [
        createMockUserEntity({
          id: "pending-1",
          email: "pending1@example.com",
          name: "대기자1",
          status: "pending",
        }),
        createMockUserEntity({
          id: "pending-2",
          email: "pending2@example.com",
          name: "대기자2",
          status: "pending",
        }),
      ]

      mockUserRepository.findPending.mockResolvedValue(pendingUsers)

      const result = await getPendingUsers()

      expect(result).toHaveLength(2)
      expect(result[0].status).toBe("pending")
      expect(result[1].status).toBe("pending")
    })

    it("should return empty array when no pending users exist", async () => {
      mockUserRepository.findPending.mockResolvedValue([])

      const result = await getPendingUsers()

      expect(result).toHaveLength(0)
    })
  })

  describe("getAllUsers", () => {
    it("should return all users", async () => {
      const allUsers = [
        createMockUserEntity({
          email: "admin@test.com",
          name: "테스트 관리자",
          status: "approved",
          isAdmin: true,
        }),
        createMockUserEntity({
          email: "test1@example.com",
          name: "사용자1",
          status: "pending",
          isAdmin: false,
        }),
        createMockUserEntity({
          email: "test2@example.com",
          name: "사용자2",
          status: "approved",
          isAdmin: false,
        }),
      ]

      mockUserRepository.findAll.mockResolvedValue(allUsers)

      const result = await getAllUsers()

      expect(result).toHaveLength(3)

      // 관리자 계정이 포함되어 있는지 확인
      const adminUser = result.find((u) => u.email === "admin@test.com")
      expect(adminUser).toBeDefined()
      expect(adminUser?.isAdmin).toBe(true)
    })

    it("should return empty array when no users exist", async () => {
      mockUserRepository.findAll.mockResolvedValue([])

      const result = await getAllUsers()

      expect(result).toHaveLength(0)
    })
  })
})
