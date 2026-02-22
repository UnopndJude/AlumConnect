import { describe, it, expect } from "vitest"
import { UserStatus } from "@/domain/user/value-objects/UserStatus"

describe("UserStatus", () => {
  it("should create pending status", () => {
    const status = UserStatus.pending()
    expect(status.getValue()).toBe("pending")
    expect(status.isPending()).toBe(true)
    expect(status.isApproved()).toBe(false)
    expect(status.isRejected()).toBe(false)
  })

  it("should create approved status", () => {
    const status = UserStatus.approved()
    expect(status.getValue()).toBe("approved")
    expect(status.isPending()).toBe(false)
    expect(status.isApproved()).toBe(true)
    expect(status.isRejected()).toBe(false)
  })

  it("should create rejected status", () => {
    const status = UserStatus.rejected()
    expect(status.getValue()).toBe("rejected")
    expect(status.isPending()).toBe(false)
    expect(status.isApproved()).toBe(false)
    expect(status.isRejected()).toBe(true)
  })

  it("should create from string", () => {
    const status = UserStatus.fromString("approved")
    expect(status.isApproved()).toBe(true)
  })

  it("should compare equality", () => {
    expect(UserStatus.pending().equals(UserStatus.pending())).toBe(true)
    expect(UserStatus.pending().equals(UserStatus.approved())).toBe(false)
  })
})
