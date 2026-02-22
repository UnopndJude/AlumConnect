import { describe, it, expect, vi, beforeEach } from "vitest"
import { RegisterUserUseCase } from "@/application/user/use-cases/RegisterUser"

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

const validDto = {
  email: "alice@example.com",
  password: "securePass",
  name: "Alice",
  graduationClass: 5,
}

describe("RegisterUserUseCase", () => {
  let userRepo: ReturnType<typeof makeUserRepo>
  let passwordHasher: ReturnType<typeof makePasswordHasher>
  let useCase: RegisterUserUseCase

  beforeEach(() => {
    userRepo = makeUserRepo()
    passwordHasher = makePasswordHasher()
    useCase = new RegisterUserUseCase(userRepo, passwordHasher)
    vi.clearAllMocks()
  })

  it("returns ValidationError for invalid email format", async () => {
    const result = await useCase.execute({ ...validDto, email: "not-an-email" })
    expect(result.success).toBe(false)
    if (!result.success) expect(result.error.name).toBe("ValidationError")
  })

  it("returns ValidationError when email is already registered", async () => {
    userRepo.findByEmail.mockResolvedValue({ id: "existing" })
    const result = await useCase.execute(validDto)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.name).toBe("ValidationError")
      expect(result.error.message).toContain("이미 등록된 이메일")
    }
  })

  it("returns ValidationError for a password that is too short", async () => {
    userRepo.findByEmail.mockResolvedValue(null)
    const result = await useCase.execute({ ...validDto, password: "abc" })
    expect(result.success).toBe(false)
    if (!result.success) expect(result.error.name).toBe("ValidationError")
  })

  it("returns ValidationError for an invalid graduation class", async () => {
    userRepo.findByEmail.mockResolvedValue(null)
    const result = await useCase.execute({ ...validDto, graduationClass: 99 })
    expect(result.success).toBe(false)
    if (!result.success) expect(result.error.name).toBe("ValidationError")
  })

  it("registers user successfully with pending status by default", async () => {
    userRepo.findByEmail.mockResolvedValue(null)
    userRepo.save.mockResolvedValue(undefined)
    passwordHasher.hash.mockResolvedValue("hashed-password")

    const result = await useCase.execute(validDto)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.value.user.email).toBe("alice@example.com")
      expect(result.value.user.name).toBe("Alice")
      expect(result.value.user.status).toBe("pending")
      expect(result.value.autoApproved).toBe(false)
    }
    expect(userRepo.save).toHaveBeenCalledOnce()
    expect(passwordHasher.hash).toHaveBeenCalledOnce()
  })

  it("auto-approves user when option is set", async () => {
    userRepo.findByEmail.mockResolvedValue(null)
    userRepo.save.mockResolvedValue(undefined)
    passwordHasher.hash.mockResolvedValue("hashed-password")

    const result = await useCase.execute(validDto, { autoApprove: true })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.value.user.status).toBe("approved")
      expect(result.value.autoApproved).toBe(true)
    }
  })

  it("trims and lowercases the email before duplicate check", async () => {
    userRepo.findByEmail.mockResolvedValue(null)
    userRepo.save.mockResolvedValue(undefined)
    passwordHasher.hash.mockResolvedValue("hashed-password")

    const result = await useCase.execute({
      ...validDto,
      email: "  ALICE@EXAMPLE.COM  ",
    })
    expect(result.success).toBe(true)
    if (result.success)
      expect(result.value.user.email).toBe("alice@example.com")
  })
})
