import { Introduction, IntroductionFormData } from '@/types/introduction'

let introductions: Introduction[] = []

export const createIntroduction = (
  userId: string, 
  userName: string, 
  userGraduationClass: number,
  data: IntroductionFormData
): Introduction => {
  const newIntroduction: Introduction = {
    id: `intro-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    userId,
    userName,
    userGraduationClass,
    ...data,
    createdAt: new Date(),
    updatedAt: new Date()
  }
  
  introductions.push(newIntroduction)
  return newIntroduction
}

export const getIntroductionByUserId = (userId: string): Introduction | undefined => {
  return introductions.find(intro => intro.userId === userId)
}

export const getIntroductionById = (id: string): Introduction | undefined => {
  return introductions.find(intro => intro.id === id)
}

export const updateIntroduction = (
  id: string, 
  data: Partial<IntroductionFormData>
): Introduction | null => {
  const index = introductions.findIndex(intro => intro.id === id)
  if (index === -1) return null
  
  introductions[index] = {
    ...introductions[index],
    ...data,
    updatedAt: new Date()
  }
  
  return introductions[index]
}

export const deleteIntroduction = (id: string): boolean => {
  const index = introductions.findIndex(intro => intro.id === id)
  if (index === -1) return false
  
  introductions.splice(index, 1)
  return true
}

export const getAllIntroductions = (): Introduction[] => {
  return introductions.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
}

export const getIntroductionsByGraduationClass = (graduationClass: number): Introduction[] => {
  return introductions.filter(intro => intro.userGraduationClass === graduationClass)
}

export const searchIntroductions = (query: string): Introduction[] => {
  const lowercaseQuery = query.toLowerCase()
  return introductions.filter(intro => 
    intro.userName.toLowerCase().includes(lowercaseQuery) ||
    intro.field.toLowerCase().includes(lowercaseQuery) ||
    intro.organization.toLowerCase().includes(lowercaseQuery) ||
    intro.selfIntroduction.toLowerCase().includes(lowercaseQuery)
  )
}