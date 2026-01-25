// Re-export types for backward compatibility
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

export interface Introduction {
  id: string
  userId: string
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

export interface IntroductionFormData {
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
}

export const STATUS_OPTIONS = [
  { value: "student", label: "학생" },
  { value: "employed", label: "직장인" },
  { value: "entrepreneur", label: "창업가" },
  { value: "graduate_student", label: "대학원생" },
  { value: "other", label: "기타" },
]

export const CONTACT_PREFERENCE_OPTIONS = [
  { value: "email", label: "이메일" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "phone", label: "전화" },
  { value: "kakao", label: "카카오톡" },
]

export const LOOKING_FOR_OPTIONS = [
  { value: "mentoring", label: "멘토링" },
  { value: "networking", label: "네트워킹" },
  { value: "collaboration", label: "협업" },
  { value: "job_opportunities", label: "구직/구인" },
  { value: "investment", label: "투자" },
]
