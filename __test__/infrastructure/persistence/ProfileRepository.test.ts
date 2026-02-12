import { describe, it, expect } from "vitest"
import { InMemoryProfileRepository } from "@/infrastructure/persistence/in-memory/InMemoryProfileRepository"
import { Profile } from "@/domain/profile/entities/Profile"
import { Email, GraduationClass } from "@/domain/user/value-objects"

describe("ProfileRepository - findAll", () => {
  async function setupTestProfiles() {
    const repository = new InMemoryProfileRepository()
    const testProfiles: Profile[] = []

    // Create test profiles
    const profilesData = [
      {
        name: "홍길동",
        email: `hong-${Date.now()}-${Math.random()}@example.com`,
        graduationClass: 5,
        isVerified: true,
      },
      {
        name: "김영희",
        email: `kim-${Date.now()}-${Math.random()}@example.com`,
        graduationClass: 6,
        isVerified: false,
      },
      {
        name: "이철수",
        email: `lee-${Date.now()}-${Math.random()}@example.com`,
        graduationClass: 5,
        isVerified: true,
      },
      {
        name: "박민수",
        email: `park-${Date.now()}-${Math.random()}@example.com`,
        graduationClass: 7,
        isVerified: true,
      },
    ]

    for (const data of profilesData) {
      const emailResult = Email.create(data.email)
      const gradClassResult = GraduationClass.create(data.graduationClass)

      if (!emailResult.success || !gradClassResult.success) {
        throw new Error("Failed to create test data")
      }

      const profile = Profile.create({
        name: data.name,
        email: emailResult.value,
        graduationClass: gradClassResult.value,
        isVerified: data.isVerified,
      })

      testProfiles.push(profile)
      await repository.save(profile)
    }

    return { repository, testProfiles }
  }

  it("should return all profiles without filters", async () => {
    const { repository, testProfiles } = await setupTestProfiles()

    // Filter to only get test profiles
    const result = await repository.findAll({
      excludeProfileId: "non-existent-id",
    })

    const ourProfiles = result.items.filter((p) =>
      testProfiles.some((tp) => tp.id.getValue() === p.id.getValue())
    )

    expect(ourProfiles.length).toBe(4)
  })

  it("should filter profiles by name", async () => {
    const { repository } = await setupTestProfiles()

    const result = await repository.findAll({ name: "홍길동" })

    const hongProfiles = result.items.filter((p) => p.name === "홍길동")
    expect(hongProfiles.length).toBeGreaterThanOrEqual(1)
    expect(hongProfiles[0].name).toBe("홍길동")
  })

  it("should filter profiles by partial name match", async () => {
    const { repository } = await setupTestProfiles()

    const result = await repository.findAll({ name: "김" })

    const kimProfiles = result.items.filter((p) => p.name.includes("김"))
    expect(kimProfiles.length).toBeGreaterThanOrEqual(1)
    expect(kimProfiles.some((p) => p.name === "김영희")).toBe(true)
  })

  it("should filter profiles by graduation class", async () => {
    const { repository, testProfiles } = await setupTestProfiles()

    const result = await repository.findAll({ graduationClass: 5 })

    const class5Profiles = result.items.filter((p) =>
      testProfiles.some(
        (tp) =>
          tp.id.getValue() === p.id.getValue() &&
          tp.graduationClass.getValue() === 5
      )
    )

    expect(class5Profiles.length).toBe(2)
    expect(class5Profiles.every((p) => p.graduationClass.getValue() === 5)).toBe(true)
  })

  it("should exclude profile by ID", async () => {
    const { repository, testProfiles } = await setupTestProfiles()

    const excludeId = testProfiles[0].id.getValue()
    const result = await repository.findAll({ excludeProfileId: excludeId })

    expect(result.items.every((p) => p.id.getValue() !== excludeId)).toBe(true)
  })

  it("should apply multiple filters", async () => {
    const { repository, testProfiles } = await setupTestProfiles()

    const result = await repository.findAll({
      graduationClass: 5,
      excludeProfileId: testProfiles[0].id.getValue(),
    })

    const matchingProfiles = result.items.filter((p) =>
      testProfiles.some(
        (tp) =>
          tp.id.getValue() === p.id.getValue() &&
          tp.graduationClass.getValue() === 5 &&
          tp.id.getValue() !== testProfiles[0].id.getValue()
      )
    )

    expect(matchingProfiles.length).toBe(1)
    expect(matchingProfiles[0].name).toBe("이철수")
  })

  it("should support pagination", async () => {
    const { repository, testProfiles } = await setupTestProfiles()

    // Get all test profile IDs
    const testIds = testProfiles.map((p) => p.id.getValue())

    const page1 = await repository.findAll(undefined, { page: 1, limit: 2 })
    const page2 = await repository.findAll(undefined, { page: 2, limit: 2 })

    expect(page1.items.length).toBeGreaterThanOrEqual(2)
    expect(page1.page).toBe(1)
    expect(page1.limit).toBe(2)
    expect(page1.totalPages).toBeGreaterThanOrEqual(2)

    expect(page2.items.length).toBeGreaterThanOrEqual(2)
    expect(page2.page).toBe(2)
    expect(page2.limit).toBe(2)
  })

  it("should return empty results when no matches", async () => {
    const { repository } = await setupTestProfiles()

    const result = await repository.findAll({ name: "존재하지않는이름XYZ999" })

    expect(result.items).toHaveLength(0)
    expect(result.total).toBe(0)
    expect(result.totalPages).toBe(0)
  })

  it("should handle pagination beyond available results", async () => {
    const { repository } = await setupTestProfiles()

    const result = await repository.findAll(
      { name: "홍길동" },
      { page: 10, limit: 20 }
    )

    expect(result.items).toHaveLength(0)
    expect(result.page).toBe(10)
  })
})
