import { DomainError } from "@/shared/errors/DomainError"
import {
  UserId,
  Email,
  Password,
  GraduationClass,
  UserStatus,
  UserStatusType,
} from "../value-objects"

export interface UserProps {
  id: UserId
  email: Email
  password: Password
  name: string
  graduationClass: GraduationClass
  status: UserStatus
  isAdmin: boolean
  createdAt: Date
  approvedAt?: Date
  rejectedAt?: Date
}

export interface CreateUserProps {
  email: Email
  password: Password
  name: string
  graduationClass: GraduationClass
  isAdmin?: boolean
  status?: UserStatus
}

export class User {
  private constructor(private props: UserProps) {}

  static create(props: CreateUserProps): User {
    return new User({
      id: UserId.create(),
      email: props.email,
      password: props.password,
      name: props.name,
      graduationClass: props.graduationClass,
      status: props.status || UserStatus.pending(),
      isAdmin: props.isAdmin || false,
      createdAt: new Date(),
    })
  }

  static reconstitute(props: UserProps): User {
    return new User(props)
  }

  // Getters
  get id(): UserId {
    return this.props.id
  }

  get email(): Email {
    return this.props.email
  }

  get password(): Password {
    return this.props.password
  }

  get name(): string {
    return this.props.name
  }

  get graduationClass(): GraduationClass {
    return this.props.graduationClass
  }

  get status(): UserStatus {
    return this.props.status
  }

  get isAdmin(): boolean {
    return this.props.isAdmin
  }

  get createdAt(): Date {
    return this.props.createdAt
  }

  get approvedAt(): Date | undefined {
    return this.props.approvedAt
  }

  get rejectedAt(): Date | undefined {
    return this.props.rejectedAt
  }

  // Domain Methods
  approve(): void {
    if (!this.props.status.isPending()) {
      throw new DomainError("이미 처리된 사용자입니다.")
    }
    this.props.status = UserStatus.approved()
    this.props.approvedAt = new Date()
  }

  reject(): void {
    if (!this.props.status.isPending()) {
      throw new DomainError("이미 처리된 사용자입니다.")
    }
    this.props.status = UserStatus.rejected()
    this.props.rejectedAt = new Date()
  }

  canLogin(): boolean {
    return this.props.status.isApproved()
  }

  // Serialization
  toPrimitives(): {
    id: string
    email: string
    password: string
    name: string
    graduationClass: number
    status: UserStatusType
    isAdmin: boolean
    createdAt: Date
    approvedAt?: Date
    rejectedAt?: Date
  } {
    return {
      id: this.props.id.getValue(),
      email: this.props.email.getValue(),
      password: this.props.password.getValue(),
      name: this.props.name,
      graduationClass: this.props.graduationClass.getValue(),
      status: this.props.status.getValue(),
      isAdmin: this.props.isAdmin,
      createdAt: this.props.createdAt,
      approvedAt: this.props.approvedAt,
      rejectedAt: this.props.rejectedAt,
    }
  }
}
