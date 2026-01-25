import { GraduationClass } from "@/domain/user/value-objects"
import { AlumniMatchResult } from "../entities/AlumniMatchResult"
import { IAlumniRepository } from "../repositories/IAlumniRepository"

export class AlumniMatchingService {
  constructor(private readonly alumniRepository: IAlumniRepository) {}

  async match(
    name: string,
    graduationClass: GraduationClass
  ): Promise<AlumniMatchResult> {
    const exactMatch = await this.alumniRepository.findByNameAndClass(
      name,
      graduationClass
    )

    if (exactMatch) {
      return AlumniMatchResult.exactMatch(exactMatch.id)
    }

    const nameMatch = await this.alumniRepository.findByName(name)

    if (nameMatch) {
      return AlumniMatchResult.partialMatch(
        `동명이인이 있습니다. 기수 정보가 일치하지 않습니다. (DB: ${nameMatch.graduationClass.getValue()}기)`
      )
    }

    return AlumniMatchResult.noMatch()
  }
}
