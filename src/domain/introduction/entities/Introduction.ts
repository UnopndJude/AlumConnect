import { UserId } from "@/domain/user/value-objects"

export type IntroductionStatus =
  | "student"
  | "employed"
  | "entrepreneur"
  | "graduate_student"
  | "other"

export type ContactPreference = "email" | "linkedin" | "phone" | "kakao"

export type LookingFor =
  | "mentoring"
  | "networking"
  | "collaboration"
  | "job_opportunities"
  | "investment"

export interface IntroductionProps {
  id: string
  userId: UserId
  name: string
  graduationClass: number
  status: IntroductionStatus
  field?: string
  organization?: string
  location?: string
  selfIntroduction: string
  lookingFor?: LookingFor
  interests?: string
  expertise?: string
  projects?: string
  contactPreference?: ContactPreference
  contactInfo?: string
  createdAt: Date
  updatedAt: Date
}

export class Introduction {
  private constructor(private props: IntroductionProps) {}

  static create(
    props: Omit<IntroductionProps, "id" | "createdAt" | "updatedAt">
  ): Introduction {
    return new Introduction({
      ...props,
      id: `intro-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
  }

  static reconstitute(props: IntroductionProps): Introduction {
    return new Introduction(props)
  }

  get id(): string {
    return this.props.id
  }

  get userId(): UserId {
    return this.props.userId
  }

  get name(): string {
    return this.props.name
  }

  get graduationClass(): number {
    return this.props.graduationClass
  }

  get status(): IntroductionStatus {
    return this.props.status
  }

  get field(): string | undefined {
    return this.props.field
  }

  get organization(): string | undefined {
    return this.props.organization
  }

  get location(): string | undefined {
    return this.props.location
  }

  get selfIntroduction(): string {
    return this.props.selfIntroduction
  }

  get lookingFor(): LookingFor | undefined {
    return this.props.lookingFor
  }

  get interests(): string | undefined {
    return this.props.interests
  }

  get expertise(): string | undefined {
    return this.props.expertise
  }

  get projects(): string | undefined {
    return this.props.projects
  }

  get contactPreference(): ContactPreference | undefined {
    return this.props.contactPreference
  }

  get contactInfo(): string | undefined {
    return this.props.contactInfo
  }

  get createdAt(): Date {
    return this.props.createdAt
  }

  get updatedAt(): Date {
    return this.props.updatedAt
  }

  update(
    updates: Partial<
      Omit<IntroductionProps, "id" | "userId" | "createdAt" | "updatedAt">
    >
  ): void {
    Object.assign(this.props, updates)
    this.props.updatedAt = new Date()
  }

  isOwnedBy(userId: UserId): boolean {
    return this.props.userId.equals(userId)
  }

  toPrimitives(): Omit<IntroductionProps, "userId"> & { userId: string } {
    return {
      ...this.props,
      userId: this.props.userId.getValue(),
    }
  }
}
