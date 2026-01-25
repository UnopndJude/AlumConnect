export class DomainError extends Error {
  constructor(
    message: string,
    public readonly code?: string
  ) {
    super(message)
    this.name = "DomainError"
  }
}

export class ValidationError extends DomainError {
  constructor(message: string) {
    super(message, "VALIDATION_ERROR")
    this.name = "ValidationError"
  }
}

export class NotFoundError extends DomainError {
  constructor(entity: string, id?: string) {
    super(
      id
        ? `${entity}을(를) 찾을 수 없습니다: ${id}`
        : `${entity}을(를) 찾을 수 없습니다.`,
      "NOT_FOUND"
    )
    this.name = "NotFoundError"
  }
}

export class UnauthorizedError extends DomainError {
  constructor(message = "인증이 필요합니다.") {
    super(message, "UNAUTHORIZED")
    this.name = "UnauthorizedError"
  }
}

export class ForbiddenError extends DomainError {
  constructor(message = "권한이 없습니다.") {
    super(message, "FORBIDDEN")
    this.name = "ForbiddenError"
  }
}
