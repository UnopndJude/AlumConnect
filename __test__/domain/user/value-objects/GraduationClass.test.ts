import { describe, it, expect } from "vitest"
import { GraduationClass } from "@/domain/user/value-objects/GraduationClass"

describe("GraduationClass", () => {
  it("should create valid graduation class", () => {
    const result = GraduationClass.create(10)
    expect(result.success).toBe(true)
    if (result.success) expect(result.value.getValue()).toBe(10)
  })

  it("should accept min value (1)", () => {
    const result = GraduationClass.create(1)
    expect(result.success).toBe(true)
  })

  it("should accept max value (50)", () => {
    const result = GraduationClass.create(50)
    expect(result.success).toBe(true)
  })

  it("should fail for 0", () => {
    expect(GraduationClass.create(0).success).toBe(false)
  })

  it("should fail for negative numbers", () => {
    expect(GraduationClass.create(-1).success).toBe(false)
  })

  it("should fail for values over 50", () => {
    expect(GraduationClass.create(51).success).toBe(false)
  })

  it("should fail for non-integers", () => {
    expect(GraduationClass.create(1.5).success).toBe(false)
  })

  it("should compare equality", () => {
    const ra = GraduationClass.create(10)
    const rb = GraduationClass.create(10)
    const rc = GraduationClass.create(20)
    if (!ra.success || !rb.success || !rc.success) throw new Error("setup")
    expect(ra.value.equals(rb.value)).toBe(true)
    expect(ra.value.equals(rc.value)).toBe(false)
  })
})
