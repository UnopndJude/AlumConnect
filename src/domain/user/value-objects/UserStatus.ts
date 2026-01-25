export type UserStatusType = "pending" | "approved" | "rejected"

export class UserStatus {
  private constructor(private readonly value: UserStatusType) {}

  static pending(): UserStatus {
    return new UserStatus("pending")
  }

  static approved(): UserStatus {
    return new UserStatus("approved")
  }

  static rejected(): UserStatus {
    return new UserStatus("rejected")
  }

  static fromString(status: UserStatusType): UserStatus {
    return new UserStatus(status)
  }

  getValue(): UserStatusType {
    return this.value
  }

  isPending(): boolean {
    return this.value === "pending"
  }

  isApproved(): boolean {
    return this.value === "approved"
  }

  isRejected(): boolean {
    return this.value === "rejected"
  }

  equals(other: UserStatus): boolean {
    return this.value === other.value
  }
}
