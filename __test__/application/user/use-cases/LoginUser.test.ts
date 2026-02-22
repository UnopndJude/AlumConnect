import { describe, it, expect, vi, beforeEach } from "vitest"
import { LoginUserUseCase } from "@/application/user/use-cases/LoginUser"
import { User } from "@/domain/user/entities/User"
import {
  Email,
  Password,
  GraduationClass,
  UserStatus,
} from "@/domain/user/value-objects"

function makeUserRepo() {
  return {
    findById: vi.fn(),
    findByEmail: vi.fn(),
    findByEmailString: vi.fn(),
    findPending: vi.fn(),
    findAll: vi.fn(),
    save: vi.fn(),
  }
}

function makePasswordHasher() {
  return {
    hash: vi.fn(),
    verify: vi.fn(),
  }
}

function buildUser(status: "pending" | "approved" | "rejected"): User {
  const email = Email.create("alice@example.com")
  const grad = GraduationClass.create(5)
  if (!email.success || !grad.success) throw new Error("factory failed")
  return User.create({
    email: email.value,
    password: Password.createFromHashed("hashed-pw"),
    name: "Alice",
    graduationClass: grad.value,
    status: UserStatus.fromString(status),
  })
}

describe("LoginUserUseCase", () => {
  let userRepo: ReturnType<typeof makeUserRepo>
  let passwordHasher: ReturnType<typeof makePasswordHasher>
  let useCase: LoginUserUseCase

  beforeEach(() => {
    userRepo = makeUserRepo()
    passwordHasher = makePasswordHasher()
    useCase = new LoginUserUseCase(userRepo, passwordHasher)
    vi.clearAllMocks()
  })

  const validDto = { email: "alice@example.com", password: "password123" }

  it("returns UnauthorizedError when email is missing", async () => {
    const result = await useCase.execute({ email: "", password: "pw" })
    expect(result.success).toBe(false)
    if (!result.success) expect(result.error.name).toBe("UnauthorizedError")
  })

  it("returns UnauthorizedError when password is missing", async () => {
    const result = await useCase.execute({ email: "a@b.com", password: "" })
    expect(result.success).toBe(false)
    if (!result.success) expect(result.error.name).toBe("UnauthorizedError")
  })

  it("returns UnauthorizedError when user is not found", async () => {
    userRepo.findByEmailString.mockResolvedValue(null)
    const result = await useCase.execute(validDto)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.name).toBe("UnauthorizedError")
      expect(result.error.message).toContain("등록되지 않은 이메일")
    }
  })

  it("returns UnauthorizedError when password does not match", async () => {
    userRepo.findByEmailString.mockResolvedValue(buildUser("approved"))
    passwordHasher.verify.mockResolvedValue(false)
    const result = await useCase.execute(validDto)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.name).toBe("UnauthorizedError")
      expect(result.error.message).toContain("비밀번호")
    }
  })

  it("returns ForbiddenError when user account is still pending", async () => {
    userRepo.findByEmailString.mockResolvedValue(buildUser("pending"))
    passwordHasher.verify.mockResolvedValue(true)
    const result = await useCase.execute(validDto)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.name).toBe("ForbiddenError")
      expect(result.error.message).toContain("승인")
    }
  })

  it("returns ForbiddenError when user account is rejected", async () => {
    userRepo.findByEmailString.mockResolvedValue(buildUser("rejected"))
    passwordHasher.verify.mockResolvedValue(true)
    const result = await useCase.execute(validDto)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.name).toBe("ForbiddenError")
      expect(result.error.message).toContain("거부")
    }
  })

  it("returns user DTO on successful login", async () => {
    userRepo.findByEmailString.mockResolvedValue(buildUser("approved"))
    passwordHasher.verify.mockResolvedValue(true)
    const result = await useCase.execute(validDto)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.value.email).toBe("alice@example.com")
      expect(result.value.name).toBe("Alice")
      expect(result.value.status).toBe("approved")
    }
  })
})
