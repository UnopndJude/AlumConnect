import { describe, it, expect } from "vitest"
import { Profile } from "@/domain/profile/entities/Profile"
import { ProfileId } from "@/domain/profile/value-objects"
import { Email, GraduationClass } from "@/domain/user/value-objects"

function makeProfile(
  overrides?: Partial<{
    isVerified: boolean
    isAdmin: boolean
    alumniId: string | null
  }>
) {
  return Profile.create({
    email: Email.create("test@test.com").value,
    name: "Test User",
    graduationClass: GraduationClass.create(10).value,
    ...overrides,
  })
}

describe("Profile", () => {
  it("should create with defaults", () => {
    const profile = makeProfile()
    expect(profile.name).toBe("Test User")
    expect(profile.email.getValue()).toBe("test@test.com")
    expect(profile.graduationClass.getValue()).toBe(10)
    expect(profile.isVerified).toBe(false)
    expect(profile.isAdmin).toBe(false)
    expect(profile.alumniId).toBeNull()
    expect(profile.createdAt).toBeInstanceOf(Date)
  })

  it("should verify a profile", () => {
    const profile = makeProfile()
    expect(profile.isVerified).toBe(false)
    profile.verify()
    expect(profile.isVerified).toBe(true)
  })

  it("should link to alumni", () => {
    const profile = makeProfile()
    expect(profile.alumniId).toBeNull()
    profile.linkToAlumni("alumni-123")
    expect(profile.alumniId).toBe("alumni-123")
  })

  it("should create with custom id", () => {
    const id = ProfileId.create("custom-id")
    const er = Email.create("x@y.com")
    const gr = GraduationClass.create(1)
    if (!er.success || !gr.success) throw new Error("setup")
    const profile = Profile.create({
      id,
      email: er.value,
      name: "Custom",
      graduationClass: gr.value,
    })
    expect(profile.id.getValue()).toBe("custom-id")
  })

  it("should reconstitute from props", () => {
    const er = Email.create("r@t.com")
    const gr = GraduationClass.create(5)
    if (!er.success || !gr.success) throw new Error("setup")
    const profile = Profile.reconstitute({
      id: ProfileId.create("p-id"),
      email: er.value,
      name: "Recon",
      graduationClass: gr.value,
      isVerified: true,
      isAdmin: true,
      alumniId: "a-1",
      createdAt: new Date("2024-01-01"),
    })
    expect(profile.id.getValue()).toBe("p-id")
    expect(profile.isVerified).toBe(true)
    expect(profile.isAdmin).toBe(true)
    expect(profile.alumniId).toBe("a-1")
  })

  it("should return defensive copy of createdAt", () => {
    const profile = makeProfile()
    const d1 = profile.createdAt
    const d2 = profile.createdAt
    expect(d1.getTime()).toBe(d2.getTime())
    expect(d1).not.toBe(d2)
  })

  it("should serialize to primitives", () => {
    const profile = makeProfile()
    const p = profile.toPrimitives()
    expect(p.email).toBe("test@test.com")
    expect(p.name).toBe("Test User")
    expect(p.graduationClass).toBe(10)
    expect(p.isVerified).toBe(false)
    expect(p.isAdmin).toBe(false)
    expect(p.alumniId).toBeNull()
    expect(p.id).toBeDefined()
  })
})
