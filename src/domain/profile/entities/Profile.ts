import { ProfileId } from "../value-objects"
import { Email, GraduationClass } from "@/domain/user/value-objects"

export interface ProfileProps {
  id: ProfileId
  email: Email
  name: string
  graduationClass: GraduationClass
  isVerified: boolean
  isAdmin: boolean
  alumniId: string | null
  createdAt: Date
}

export interface CreateProfileProps {
  id?: ProfileId
  email: Email
  name: string
  graduationClass: GraduationClass
  isVerified?: boolean
  isAdmin?: boolean
  alumniId?: string | null
}

export class Profile {
  private constructor(private props: ProfileProps) {}

  static create(props: CreateProfileProps): Profile {
    return new Profile({
      id: props.id ?? ProfileId.create(),
      email: props.email,
      name: props.name,
      graduationClass: props.graduationClass,
      isVerified: props.isVerified ?? false,
      isAdmin: props.isAdmin ?? false,
      alumniId: props.alumniId ?? null,
      createdAt: new Date(),
    })
  }

  static reconstitute(props: ProfileProps): Profile {
    return new Profile(props)
  }

  // Getters
  get id(): ProfileId {
    return this.props.id
  }

  get email(): Email {
    return this.props.email
  }

  get name(): string {
    return this.props.name
  }

  get graduationClass(): GraduationClass {
    return this.props.graduationClass
  }

  get isVerified(): boolean {
    return this.props.isVerified
  }

  get isAdmin(): boolean {
    return this.props.isAdmin
  }

  get alumniId(): string | null {
    return this.props.alumniId
  }

  get createdAt(): Date {
    return new Date(this.props.createdAt.getTime())
  }

  // Domain Methods
  verify(): void {
    this.props.isVerified = true
  }

  linkToAlumni(alumniId: string): void {
    this.props.alumniId = alumniId
  }

  // Serialization
  toPrimitives(): {
    id: string
    email: string
    name: string
    graduationClass: number
    isVerified: boolean
    isAdmin: boolean
    alumniId: string | null
    createdAt: Date
  } {
    return {
      id: this.props.id.getValue(),
      email: this.props.email.getValue(),
      name: this.props.name,
      graduationClass: this.props.graduationClass.getValue(),
      isVerified: this.props.isVerified,
      isAdmin: this.props.isAdmin,
      alumniId: this.props.alumniId,
      createdAt: this.props.createdAt,
    }
  }
}
