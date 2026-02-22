import { describe, it, expect } from "vitest"
import { User } from "@/domain/user/entities/User"
import {
  Email,
  Password,
  GraduationClass,
  UserStatus,
  UserId,
} from "@/domain/user/value-objects"

function makeUser(overrides?: { status?: UserStatus; isAdmin?: boolean }) {
  const emailResult = Email.create("test@test.com")
  const gcResult = GraduationClass.create(10)
  if (!emailResult.success || !gcResult.success) throw new Error("setup")
  return User.create({
    email: emailResult.value,
    password: Password.createFromHashed("hashed"),
    name: "Test User",
    graduationClass: gcResult.value,
    ...overrides,
  })
}

describe("User", () => {
  it("should create a user with pending status by default", () => {
    const user = makeUser()
    expect(user.status.isPending()).toBe(true)
    expect(user.isAdmin).toBe(false)
    expect(user.name).toBe("Test User")
    expect(user.email.getValue()).toBe("test@test.com")
  })

  it("should approve a pending user", () => {
    const user = makeUser()
    user.approve()
    expect(user.status.isApproved()).toBe(true)
    expect(user.approvedAt).toBeInstanceOf(Date)
  })

  it("should reject a pending user", () => {
    const user = makeUser()
    user.reject()
    expect(user.status.isRejected()).toBe(true)
    expect(user.rejectedAt).toBeInstanceOf(Date)
  })

  it("should throw when approving non-pending user", () => {
    const user = makeUser()
    user.approve()
    expect(() => user.approve()).toThrow("이미 처리된 사용자입니다.")
  })

  it("should throw when rejecting non-pending user", () => {
    const user = makeUser()
    user.reject()
    expect(() => user.reject()).toThrow("이미 처리된 사용자입니다.")
  })

  it("should allow login only when approved", () => {
    const user = makeUser()
    expect(user.canLogin()).toBe(false)
    user.approve()
    expect(user.canLogin()).toBe(true)
  })

  it("should reconstitute from props", () => {
    const id = UserId.create("existing-id")
    const er = Email.create("r@test.com")
    const gr = GraduationClass.create(5)
    if (!er.success || !gr.success) throw new Error("setup")
    const user = User.reconstitute({
      id,
      email: er.value,
      password: Password.createFromHashed("h"),
      name: "Recon",
      graduationClass: gr.value,
      status: UserStatus.approved(),
      isAdmin: true,
      createdAt: new Date("2024-01-01"),
      approvedAt: new Date("2024-01-02"),
    })
    expect(user.id.getValue()).toBe("existing-id")
    expect(user.isAdmin).toBe(true)
    expect(user.status.isApproved()).toBe(true)
  })

  it("should serialize to primitives", () => {
    const user = makeUser()
    const p = user.toPrimitives()
    expect(p.email).toBe("test@test.com")
    expect(p.name).toBe("Test User")
    expect(p.graduationClass).toBe(10)
    expect(p.status).toBe("pending")
    expect(p.isAdmin).toBe(false)
    expect(p.id).toBeDefined()
    expect(p.createdAt).toBeInstanceOf(Date)
  })
})
