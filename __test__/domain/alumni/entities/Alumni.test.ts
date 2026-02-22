import { describe, it, expect } from "vitest"
import { Alumni } from "@/domain/alumni/entities/Alumni"
import { GraduationClass } from "@/domain/user/value-objects"
import { AlumniId } from "@/domain/alumni/value-objects"

function makeAlumni() {
  const gc = GraduationClass.create(10)
  if (!gc.success) throw new Error("setup")
  return Alumni.create({
    name: "Kim Cheolsu",
    graduationClass: gc.value,
    birthYear: 1990,
  })
}

describe("Alumni", () => {
  it("should create with unregistered status", () => {
    const alumni = makeAlumni()
    expect(alumni.name).toBe("Kim Cheolsu")
    expect(alumni.graduationClass.getValue()).toBe(10)
    expect(alumni.birthYear).toBe(1990)
    expect(alumni.isRegistered).toBe(false)
  })

  it("should mark as registered", () => {
    const alumni = makeAlumni()
    alumni.markAsRegistered()
    expect(alumni.isRegistered).toBe(true)
  })

  it("should match name and class when unregistered", () => {
    const gc = GraduationClass.create(10)
    if (!gc.success) throw new Error("setup")
    const alumni = makeAlumni()
    expect(alumni.matchesNameAndClass("Kim Cheolsu", gc.value)).toBe(true)
  })

  it("should not match after registration", () => {
    const gc = GraduationClass.create(10)
    if (!gc.success) throw new Error("setup")
    const alumni = makeAlumni()
    alumni.markAsRegistered()
    expect(alumni.matchesNameAndClass("Kim Cheolsu", gc.value)).toBe(false)
  })

  it("should not match different name", () => {
    const gc = GraduationClass.create(10)
    if (!gc.success) throw new Error("setup")
    const alumni = makeAlumni()
    expect(alumni.matchesNameAndClass("Other", gc.value)).toBe(false)
  })

  it("should not match different class", () => {
    const gc = GraduationClass.create(20)
    if (!gc.success) throw new Error("setup")
    const alumni = makeAlumni()
    expect(alumni.matchesNameAndClass("Kim Cheolsu", gc.value)).toBe(false)
  })

  it("should match name only when unregistered", () => {
    const alumni = makeAlumni()
    expect(alumni.matchesName("Kim Cheolsu")).toBe(true)
    expect(alumni.matchesName("Other")).toBe(false)
  })

  it("should not match name after registration", () => {
    const alumni = makeAlumni()
    alumni.markAsRegistered()
    expect(alumni.matchesName("Kim Cheolsu")).toBe(false)
  })

  it("should reconstitute from props", () => {
    const gc = GraduationClass.create(5)
    if (!gc.success) throw new Error("setup")
    const alumni = Alumni.reconstitute({
      id: AlumniId.create("a-id"),
      name: "Recon",
      graduationClass: gc.value,
      isRegistered: true,
    })
    expect(alumni.id.getValue()).toBe("a-id")
    expect(alumni.isRegistered).toBe(true)
  })

  it("should serialize to primitives", () => {
    const alumni = makeAlumni()
    const p = alumni.toPrimitives()
    expect(p.name).toBe("Kim Cheolsu")
    expect(p.graduationClass).toBe(10)
    expect(p.birthYear).toBe(1990)
    expect(p.isRegistered).toBe(false)
  })
})
