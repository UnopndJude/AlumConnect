import { describe, it, expect } from "vitest"
import { Password } from "@/domain/user/value-objects/Password"

describe("Password", () => {
  describe("createFromPlain", () => {
    it("should create from valid plain password", () => {
      const result = Password.createFromPlain("password123")
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.value.needsHashing).toBe(true)
        expect(result.value.plainValue).toBe("password123")
      }
    })

    it("should fail for empty password", () => {
      const result = Password.createFromPlain("")
      expect(result.success).toBe(false)
    })

    it("should fail for password shorter than 6 chars", () => {
      const result = Password.createFromPlain("12345")
      expect(result.success).toBe(false)
    })

    it("should accept exactly 6 chars", () => {
      const result = Password.createFromPlain("123456")
      expect(result.success).toBe(true)
    })
  })

  describe("createFromHashed", () => {
    it("should create from hashed value", () => {
      const password = Password.createFromHashed("$2b$10$hashedvalue")
      expect(password.getValue()).toBe("$2b$10$hashedvalue")
      expect(password.isAlreadyHashed()).toBe(true)
    })
  })
})
