import { describe, it, expect } from "vitest"
import { Email } from "@/domain/user/value-objects/Email"

describe("Email", () => {
  it("should create a valid email", () => {
    const result = Email.create("test@example.com")
    expect(result.success).toBe(true)
    if (result.success) expect(result.value.getValue()).toBe("test@example.com")
  })

  it("should trim and lowercase email", () => {
    const result = Email.create("  Test@Example.COM  ")
    expect(result.success).toBe(true)
    if (result.success) expect(result.value.getValue()).toBe("test@example.com")
  })

  it("should fail for empty email", () => {
    const result = Email.create("")
    expect(result.success).toBe(false)
  })

  it("should fail for whitespace-only email", () => {
    const result = Email.create("   ")
    expect(result.success).toBe(false)
  })

  it("should fail for invalid format", () => {
    const r1 = Email.create("notanemail")
    const r2 = Email.create("@domain.com")
    const r3 = Email.create("user@")
    expect(r1.success).toBe(false)
    expect(r2.success).toBe(false)
    expect(r3.success).toBe(false)
  })

  it("should compare equality", () => {
    const ra = Email.create("a@b.com")
    const rb = Email.create("a@b.com")
    const rc = Email.create("x@y.com")
    if (!ra.success || !rb.success || !rc.success) throw new Error("setup")
    expect(ra.value.equals(rb.value)).toBe(true)
    expect(ra.value.equals(rc.value)).toBe(false)
  })
})
