import { GraduationClass } from "@/domain/user/value-objects"
import { AlumniId } from "../value-objects"

export interface AlumniProps {
  id: AlumniId
  name: string
  graduationClass: GraduationClass
  birthYear?: number
  isRegistered: boolean
}

export class Alumni {
  private constructor(private props: AlumniProps) {}

  static create(props: Omit<AlumniProps, "id" | "isRegistered">): Alumni {
    return new Alumni({
      ...props,
      id: AlumniId.create(),
      isRegistered: false,
    })
  }

  static reconstitute(props: AlumniProps): Alumni {
    return new Alumni(props)
  }

  get id(): AlumniId {
    return this.props.id
  }

  get name(): string {
    return this.props.name
  }

  get graduationClass(): GraduationClass {
    return this.props.graduationClass
  }

  get birthYear(): number | undefined {
    return this.props.birthYear
  }

  get isRegistered(): boolean {
    return this.props.isRegistered
  }

  markAsRegistered(): void {
    this.props.isRegistered = true
  }

  matchesNameAndClass(name: string, graduationClass: GraduationClass): boolean {
    return (
      this.props.name === name &&
      this.props.graduationClass.equals(graduationClass) &&
      !this.props.isRegistered
    )
  }

  matchesName(name: string): boolean {
    return this.props.name === name && !this.props.isRegistered
  }

  toPrimitives() {
    return {
      id: this.props.id.getValue(),
      name: this.props.name,
      graduationClass: this.props.graduationClass.getValue(),
      birthYear: this.props.birthYear,
      isRegistered: this.props.isRegistered,
    }
  }
}
