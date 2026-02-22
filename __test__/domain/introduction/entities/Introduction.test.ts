import { describe, it, expect } from "vitest"
import { Introduction } from "@/domain/introduction/entities/Introduction"
import { UserId } from "@/domain/user/value-objects"

function makeIntroduction(userId?: string) {
  return Introduction.create({
    userId: UserId.create(userId ?? "user-1"),
    name: "Test User",
    graduationClass: 10,
    status: "employed",
    field: "Engineering",
    organization: "TestCorp",
    location: "Seoul",
    selfIntroduction: "Hello, I am a test user.",
    lookingFor: "networking",
    interests: "AI, ML",
    expertise: "Backend",
    contactPreference: "email",
    contactInfo: "test@test.com",
  })
}

describe("Introduction", () => {
  it("should create with all properties", () => {
    const intro = makeIntroduction()
    expect(intro.name).toBe("Test User")
    expect(intro.graduationClass).toBe(10)
    expect(intro.status).toBe("employed")
    expect(intro.field).toBe("Engineering")
    expect(intro.organization).toBe("TestCorp")
    expect(intro.location).toBe("Seoul")
    expect(intro.selfIntroduction).toBe("Hello, I am a test user.")
    expect(intro.lookingFor).toBe("networking")
    expect(intro.interests).toBe("AI, ML")
    expect(intro.expertise).toBe("Backend")
    expect(intro.contactPreference).toBe("email")
    expect(intro.contactInfo).toBe("test@test.com")
    expect(intro.id).toBeDefined()
    expect(intro.createdAt).toBeInstanceOf(Date)
    expect(intro.updatedAt).toBeInstanceOf(Date)
  })

  it("should create with minimal props", () => {
    const intro = Introduction.create({
      userId: UserId.create("u-1"),
      name: "Min",
      graduationClass: 1,
      status: "student",
      selfIntroduction: "Minimal intro",
    })
    expect(intro.name).toBe("Min")
    expect(intro.field).toBeUndefined()
    expect(intro.organization).toBeUndefined()
  })

  it("should check ownership", () => {
    const intro = makeIntroduction("owner-id")
    expect(intro.isOwnedBy(UserId.create("owner-id"))).toBe(true)
    expect(intro.isOwnedBy(UserId.create("other-id"))).toBe(false)
  })

  it("should update properties", () => {
    const intro = makeIntroduction()
    const before = intro.updatedAt
    intro.update({
      name: "Updated",
      field: "Design",
      status: "entrepreneur",
    })
    expect(intro.name).toBe("Updated")
    expect(intro.field).toBe("Design")
    expect(intro.status).toBe("entrepreneur")
    expect(intro.updatedAt.getTime()).toBeGreaterThanOrEqual(before.getTime())
  })

  it("should reconstitute from props", () => {
    const intro = Introduction.reconstitute({
      id: "intro-id",
      userId: UserId.create("u-1"),
      name: "Recon",
      graduationClass: 5,
      status: "other",
      selfIntroduction: "Reconstituted",
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-06-01"),
    })
    expect(intro.id).toBe("intro-id")
    expect(intro.name).toBe("Recon")
  })

  it("should serialize to primitives", () => {
    const intro = makeIntroduction("user-1")
    const p = intro.toPrimitives()
    expect(p.userId).toBe("user-1")
    expect(p.name).toBe("Test User")
    expect(p.graduationClass).toBe(10)
    expect(p.status).toBe("employed")
    expect(p.selfIntroduction).toBe("Hello, I am a test user.")
  })
})
