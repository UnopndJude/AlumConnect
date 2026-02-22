import { describe, it, expect, vi, beforeEach } from "vitest"
import {
  CreateIntroductionUseCase,
  GetIntroductionsUseCase,
  GetIntroductionByIdUseCase,
  UpdateIntroductionUseCase,
  DeleteIntroductionUseCase,
} from "@/application/introduction/use-cases/IntroductionUseCases"
import { Introduction } from "@/domain/introduction/entities/Introduction"
import { User } from "@/domain/user/entities/User"
import {
  Email,
  Password,
  GraduationClass,
  UserStatus,
  UserId,
} from "@/domain/user/value-objects"

function makeApprovedUser(): User {
  const email = Email.create("approved@test.com")
  const grad = GraduationClass.create(5)
  if (!email.success || !grad.success) throw new Error("factory failed")
  return User.create({
    email: email.value,
    password: Password.createFromHashed("hash"),
    name: "Approved",
    graduationClass: grad.value,
    status: UserStatus.approved(),
  })
}

function makePendingUser(): User {
  const email = Email.create("pending@test.com")
  const grad = GraduationClass.create(5)
  if (!email.success || !grad.success) throw new Error("factory failed")
  return User.create({
    email: email.value,
    password: Password.createFromHashed("hash"),
    name: "Pending",
    graduationClass: grad.value,
  })
}

function makeIntroduction(userId: string): Introduction {
  return Introduction.create({
    userId: UserId.create(userId),
    name: "Tester",
    graduationClass: 5,
    status: "employed",
    selfIntroduction: "Hello!",
  })
}

function makeIntroRepo() {
  return {
    findAll: vi.fn(),
    findById: vi.fn(),
    findByUserId: vi.fn(),
    findByGraduationClass: vi.fn(),
    search: vi.fn(),
    save: vi.fn(),
    delete: vi.fn(),
  }
}

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

describe("CreateIntroductionUseCase", () => {
  const introRepo = makeIntroRepo()
  const userRepo = makeUserRepo()

  const useCase = new CreateIntroductionUseCase(introRepo, userRepo)

  const baseDto = {
    userId: "user-1",
    name: "Tester",
    graduationClass: 5,
    status: "employed" as const,
    selfIntroduction: "Hello!",
  }

  beforeEach(() => vi.clearAllMocks())

  it("returns NotFoundError when user not found", async () => {
    userRepo.findById.mockResolvedValue(null)
    const result = await useCase.execute(baseDto)
    expect(result.success).toBe(false)
    if (!result.success) expect(result.error.name).toBe("NotFoundError")
  })

  it("returns ForbiddenError when user is not approved", async () => {
    userRepo.findById.mockResolvedValue(makePendingUser())
    const result = await useCase.execute(baseDto)
    expect(result.success).toBe(false)
    if (!result.success) expect(result.error.name).toBe("ForbiddenError")
  })

  it("returns ValidationError when introduction already exists", async () => {
    userRepo.findById.mockResolvedValue(makeApprovedUser())
    introRepo.findByUserId.mockResolvedValue(makeIntroduction("user-1"))
    const result = await useCase.execute(baseDto)
    expect(result.success).toBe(false)
    if (!result.success) expect(result.error.name).toBe("ValidationError")
  })

  it("saves and returns introduction on success", async () => {
    userRepo.findById.mockResolvedValue(makeApprovedUser())
    introRepo.findByUserId.mockResolvedValue(null)
    introRepo.save.mockResolvedValue(undefined)

    const result = await useCase.execute(baseDto)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.value.name).toBe("Tester")
      expect(result.value.selfIntroduction).toBe("Hello!")
      expect(result.value.graduationClass).toBe(5)
    }
    expect(introRepo.save).toHaveBeenCalledOnce()
  })

  it("passes optional fields through on success", async () => {
    userRepo.findById.mockResolvedValue(makeApprovedUser())
    introRepo.findByUserId.mockResolvedValue(null)
    introRepo.save.mockResolvedValue(undefined)

    const result = await useCase.execute({
      ...baseDto,
      field: "Engineering",
      organization: "ACME",
      contactPreference: "email",
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.value.field).toBe("Engineering")
      expect(result.value.organization).toBe("ACME")
    }
  })
})

describe("GetIntroductionsUseCase", () => {
  const introRepo = makeIntroRepo()
  const useCase = new GetIntroductionsUseCase(introRepo)

  beforeEach(() => vi.clearAllMocks())

  it("returns all introductions as primitives", async () => {
    introRepo.findAll.mockResolvedValue([
      makeIntroduction("u1"),
      makeIntroduction("u2"),
    ])
    const result = await useCase.execute()
    expect(result).toHaveLength(2)
    expect(result[0].name).toBe("Tester")
  })

  it("returns empty array when there are no introductions", async () => {
    introRepo.findAll.mockResolvedValue([])
    const result = await useCase.execute()
    expect(result).toHaveLength(0)
  })
})

describe("GetIntroductionByIdUseCase", () => {
  const introRepo = makeIntroRepo()
  const useCase = new GetIntroductionByIdUseCase(introRepo)

  beforeEach(() => vi.clearAllMocks())

  it("returns NotFoundError when introduction not found", async () => {
    introRepo.findById.mockResolvedValue(null)
    const result = await useCase.execute("non-existent")
    expect(result.success).toBe(false)
    if (!result.success) expect(result.error.name).toBe("NotFoundError")
  })

  it("returns introduction primitives when found", async () => {
    introRepo.findById.mockResolvedValue(makeIntroduction("u1"))
    const result = await useCase.execute("some-id")
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.value.selfIntroduction).toBe("Hello!")
      expect(result.value.status).toBe("employed")
    }
  })
})

describe("UpdateIntroductionUseCase", () => {
  const introRepo = makeIntroRepo()
  const useCase = new UpdateIntroductionUseCase(introRepo)

  const OWNER = "owner-id"
  const OTHER = "other-id"

  beforeEach(() => vi.clearAllMocks())

  it("returns NotFoundError when introduction not found", async () => {
    introRepo.findById.mockResolvedValue(null)
    const result = await useCase.execute("id", OWNER, {})
    expect(result.success).toBe(false)
    if (!result.success) expect(result.error.name).toBe("NotFoundError")
  })

  it("returns ForbiddenError when user does not own the introduction", async () => {
    introRepo.findById.mockResolvedValue(makeIntroduction(OWNER))
    const result = await useCase.execute("id", OTHER, {})
    expect(result.success).toBe(false)
    if (!result.success) expect(result.error.name).toBe("ForbiddenError")
  })

  it("updates and returns primitives on success", async () => {
    introRepo.findById.mockResolvedValue(makeIntroduction(OWNER))
    introRepo.save.mockResolvedValue(undefined)

    const result = await useCase.execute("id", OWNER, {
      selfIntroduction: "Updated bio",
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.value.selfIntroduction).toBe("Updated bio")
    }
    expect(introRepo.save).toHaveBeenCalledOnce()
  })
})

describe("DeleteIntroductionUseCase", () => {
  const introRepo = makeIntroRepo()
  const useCase = new DeleteIntroductionUseCase(introRepo)

  const OWNER = "owner-id"
  const OTHER = "other-id"

  beforeEach(() => vi.clearAllMocks())

  it("returns NotFoundError when introduction not found", async () => {
    introRepo.findById.mockResolvedValue(null)
    const result = await useCase.execute("id", OWNER)
    expect(result.success).toBe(false)
    if (!result.success) expect(result.error.name).toBe("NotFoundError")
  })

  it("returns ForbiddenError when user does not own the introduction", async () => {
    introRepo.findById.mockResolvedValue(makeIntroduction(OWNER))
    const result = await useCase.execute("id", OTHER)
    expect(result.success).toBe(false)
    if (!result.success) expect(result.error.name).toBe("ForbiddenError")
  })

  it("deletes the introduction and returns ok on success", async () => {
    const intro = makeIntroduction(OWNER)
    introRepo.findById.mockResolvedValue(intro)
    introRepo.delete.mockResolvedValue(undefined)

    const result = await useCase.execute("target-id", OWNER)
    expect(result.success).toBe(true)
    expect(introRepo.delete).toHaveBeenCalledWith("target-id")
  })
})
