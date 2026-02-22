import { describe, it, expect, vi, beforeEach } from "vitest"
import {
  ApproveUserUseCase,
  RejectUserUseCase,
  GetPendingUsersUseCase,
} from "@/application/user/use-cases/ApproveUser"
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

function makePendingUser(): User {
  const email = Email.create("bob@example.com")
  const grad = GraduationClass.create(3)
  if (!email.success || !grad.success) throw new Error("factory failed")
  return User.create({
    email: email.value,
    password: Password.createFromHashed("hash"),
    name: "Bob",
    graduationClass: grad.value,
  })
}

describe("ApproveUserUseCase", () => {
  let userRepo: ReturnType<typeof makeUserRepo>
  let useCase: ApproveUserUseCase

  beforeEach(() => {
    userRepo = makeUserRepo()
    useCase = new ApproveUserUseCase(userRepo)
    vi.clearAllMocks()
  })

  it("returns NotFoundError when user does not exist", async () => {
    userRepo.findById.mockResolvedValue(null)
    const result = await useCase.execute("non-existent-id")
    expect(result.success).toBe(false)
    if (!result.success) expect(result.error.name).toBe("NotFoundError")
  })

  it("approves user and returns updated DTO", async () => {
    const user = makePendingUser()
    userRepo.findById.mockResolvedValue(user)
    userRepo.save.mockResolvedValue(undefined)

    const result = await useCase.execute("some-id")
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.value.status).toBe("approved")
      expect(result.value.name).toBe("Bob")
    }
    expect(userRepo.save).toHaveBeenCalledOnce()
  })
})

describe("RejectUserUseCase", () => {
  let userRepo: ReturnType<typeof makeUserRepo>
  let useCase: RejectUserUseCase

  beforeEach(() => {
    userRepo = makeUserRepo()
    useCase = new RejectUserUseCase(userRepo)
    vi.clearAllMocks()
  })

  it("returns NotFoundError when user does not exist", async () => {
    userRepo.findById.mockResolvedValue(null)
    const result = await useCase.execute("non-existent-id")
    expect(result.success).toBe(false)
    if (!result.success) expect(result.error.name).toBe("NotFoundError")
  })

  it("rejects user and returns updated DTO with rejected status", async () => {
    const user = makePendingUser()
    userRepo.findById.mockResolvedValue(user)
    userRepo.save.mockResolvedValue(undefined)

    const result = await useCase.execute("some-id")
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.value.status).toBe("rejected")
    }
    expect(userRepo.save).toHaveBeenCalledOnce()
  })
})

describe("GetPendingUsersUseCase", () => {
  let userRepo: ReturnType<typeof makeUserRepo>
  let useCase: GetPendingUsersUseCase

  beforeEach(() => {
    userRepo = makeUserRepo()
    useCase = new GetPendingUsersUseCase(userRepo)
    vi.clearAllMocks()
  })

  it("returns all pending users as DTOs", async () => {
    const pending = [makePendingUser(), makePendingUser()]
    userRepo.findPending.mockResolvedValue(pending)

    const result = await useCase.execute()
    expect(result).toHaveLength(2)
    expect(result[0].status).toBe("pending")
    expect(result[0].name).toBe("Bob")
  })

  it("returns empty array when no pending users exist", async () => {
    userRepo.findPending.mockResolvedValue([])
    const result = await useCase.execute()
    expect(result).toHaveLength(0)
  })
})
