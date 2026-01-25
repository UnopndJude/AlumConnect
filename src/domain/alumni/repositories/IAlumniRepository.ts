import { GraduationClass } from "@/domain/user/value-objects"
import { Alumni } from "../entities/Alumni"
import { AlumniId } from "../value-objects"

export interface IAlumniRepository {
  findById(id: AlumniId): Promise<Alumni | null>
  findByNameAndClass(
    name: string,
    graduationClass: GraduationClass
  ): Promise<Alumni | null>
  findByName(name: string): Promise<Alumni | null>
  save(alumni: Alumni): Promise<void>
  findAll(): Promise<Alumni[]>
}
