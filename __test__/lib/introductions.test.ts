import { describe, it, expect, beforeEach, vi } from "vitest"
import { Introduction } from "@/types/introduction"

// Mock the container
vi.mock("@/infrastructure/di/container", () => ({
  container: {
    getIntroductionRepository: vi.fn(),
  },
}))

import { container } from "@/infrastructure/di/container"
import {
  getAllIntroductions,
  getIntroductionById,
  getIntroductionByUserId,
  searchIntroductions,
  getIntroductionsByGraduationClass,
} from "@/lib/introductions"

const mockIntroductionRepository = {
  findAll: vi.fn(),
  findById: vi.fn(),
  findByUserId: vi.fn(),
  search: vi.fn(),
  findByGraduationClass: vi.fn(),
  save: vi.fn(),
  delete: vi.fn(),
}

// Mock introduction entity
const createMockIntroEntity = (data: Partial<Introduction>) => ({
  toPrimitives: () => ({
    id: data.id || "intro-123",
    userId: data.userId || "user-123",
    name: data.name || "홍길동",
    graduationClass: data.graduationClass || 10,
    status: data.status || "employed",
    field: data.field,
    organization: data.organization,
    location: data.location,
    selfIntroduction:
      data.selfIntroduction || "안녕하세요. 소프트웨어 엔지니어입니다.",
    lookingFor: data.lookingFor,
    interests: data.interests,
    expertise: data.expertise,
    projects: data.projects,
    contactPreference: data.contactPreference,
    contactInfo: data.contactInfo,
    createdAt: data.createdAt || new Date(),
    updatedAt: data.updatedAt || new Date(),
  }),
})

describe("Introduction Operations", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(container.getIntroductionRepository).mockReturnValue(
      mockIntroductionRepository as ReturnType<
        typeof container.getIntroductionRepository
      >
    )
  })

  describe("getAllIntroductions", () => {
    it("should return all introductions", async () => {
      const mockIntros = [
        createMockIntroEntity({
          id: "intro-1",
          userId: "user-1",
          name: "사용자1",
          graduationClass: 10,
        }),
        createMockIntroEntity({
          id: "intro-2",
          userId: "user-2",
          name: "사용자2",
          graduationClass: 11,
        }),
      ]

      mockIntroductionRepository.findAll.mockResolvedValue(mockIntros)

      const result = await getAllIntroductions()

      expect(result).toHaveLength(2)
      expect(result[0].name).toBe("사용자1")
      expect(result[1].name).toBe("사용자2")
    })

    it("should return empty array when no introductions exist", async () => {
      mockIntroductionRepository.findAll.mockResolvedValue([])

      const result = await getAllIntroductions()

      expect(result).toHaveLength(0)
    })
  })

  describe("getIntroductionById", () => {
    it("should return introduction when ID exists", async () => {
      const mockIntro = createMockIntroEntity({
        id: "intro-123",
        userId: "user-123",
        name: "홍길동",
      })

      mockIntroductionRepository.findById.mockResolvedValue(mockIntro)

      const found = await getIntroductionById("intro-123")

      expect(found).toBeDefined()
      expect(found?.id).toBe("intro-123")
      expect(found?.name).toBe("홍길동")
    })

    it("should return undefined when ID does not exist", async () => {
      mockIntroductionRepository.findById.mockResolvedValue(null)

      const found = await getIntroductionById("nonexistent-id")

      expect(found).toBeUndefined()
    })
  })

  describe("getIntroductionByUserId", () => {
    it("should return introduction when user has one", async () => {
      const mockIntro = createMockIntroEntity({
        id: "intro-123",
        userId: "user-123",
        name: "홍길동",
      })

      mockIntroductionRepository.findByUserId.mockResolvedValue(mockIntro)

      const found = await getIntroductionByUserId("user-123")

      expect(found).toBeDefined()
      expect(found?.userId).toBe("user-123")
    })

    it("should return undefined when user has no introduction", async () => {
      mockIntroductionRepository.findByUserId.mockResolvedValue(null)

      const found = await getIntroductionByUserId("nonexistent-user")

      expect(found).toBeUndefined()
    })
  })

  describe("searchIntroductions", () => {
    it("should search by user name", async () => {
      const mockIntro = createMockIntroEntity({
        name: "홍길동",
        field: "컴퓨터공학",
        organization: "삼성전자",
      })

      mockIntroductionRepository.search.mockResolvedValue([mockIntro])

      const results = await searchIntroductions("홍길동")

      expect(results).toHaveLength(1)
      expect(results[0].name).toBe("홍길동")
    })

    it("should search by field", async () => {
      const mockIntro = createMockIntroEntity({
        name: "홍길동",
        field: "컴퓨터공학",
      })

      mockIntroductionRepository.search.mockResolvedValue([mockIntro])

      const results = await searchIntroductions("컴퓨터")

      expect(results).toHaveLength(1)
      expect(results[0].field).toBe("컴퓨터공학")
    })

    it("should return empty array when no matches found", async () => {
      mockIntroductionRepository.search.mockResolvedValue([])

      const results = await searchIntroductions("존재하지않는검색어")

      expect(results).toHaveLength(0)
    })
  })

  describe("getIntroductionsByGraduationClass", () => {
    it("should return only introductions from specified graduation class", async () => {
      const mockIntros = [
        createMockIntroEntity({
          name: "10기 사용자1",
          graduationClass: 10,
        }),
        createMockIntroEntity({
          name: "10기 사용자2",
          graduationClass: 10,
        }),
      ]

      mockIntroductionRepository.findByGraduationClass.mockResolvedValue(
        mockIntros
      )

      const result = await getIntroductionsByGraduationClass(10)

      expect(result).toHaveLength(2)
      result.forEach((intro) => {
        expect(intro.graduationClass).toBe(10)
      })
    })

    it("should return empty array when no introductions exist for graduation class", async () => {
      mockIntroductionRepository.findByGraduationClass.mockResolvedValue([])

      const result = await getIntroductionsByGraduationClass(99)

      expect(result).toHaveLength(0)
    })
  })
})
