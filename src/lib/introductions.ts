// Compatibility layer - delegates to new architecture
import { container } from "@/infrastructure/di/container"
import { Introduction } from "@/types/introduction"
import { UserId } from "@/domain/user/value-objects"

export const getAllIntroductions = async (): Promise<Introduction[]> => {
  const intros = await container.getIntroductionRepository().findAll()
  return intros.map((i) => i.toPrimitives() as Introduction)
}

export const getIntroductionById = async (
  id: string
): Promise<Introduction | undefined> => {
  const intro = await container.getIntroductionRepository().findById(id)
  return intro ? (intro.toPrimitives() as Introduction) : undefined
}

export const getIntroductionByUserId = async (
  userId: string
): Promise<Introduction | undefined> => {
  const intro = await container
    .getIntroductionRepository()
    .findByUserId(UserId.create(userId))
  return intro ? (intro.toPrimitives() as Introduction) : undefined
}

export const searchIntroductions = async (
  query: string
): Promise<Introduction[]> => {
  const intros = await container.getIntroductionRepository().search(query)
  return intros.map((i) => i.toPrimitives() as Introduction)
}

export const getIntroductionsByGraduationClass = async (
  graduationClass: number
): Promise<Introduction[]> => {
  const intros = await container
    .getIntroductionRepository()
    .findByGraduationClass(graduationClass)
  return intros.map((i) => i.toPrimitives() as Introduction)
}
