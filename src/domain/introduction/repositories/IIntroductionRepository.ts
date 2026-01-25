import { UserId } from "@/domain/user/value-objects"
import { Introduction } from "../entities/Introduction"

export interface IIntroductionRepository {
  findById(id: string): Promise<Introduction | null>
  findByUserId(userId: UserId): Promise<Introduction | null>
  findAll(): Promise<Introduction[]>
  findByGraduationClass(graduationClass: number): Promise<Introduction[]>
  search(query: string): Promise<Introduction[]>
  save(introduction: Introduction): Promise<void>
  delete(id: string): Promise<boolean>
}
