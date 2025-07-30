export interface Introduction {
  id: string
  userId: string
  userName: string
  userGraduationClass: number
  
  // 필수 질문들
  currentStatus: string // 현재 상태 (대학생/대학원생/직장인/창업/기타)
  field: string // 전공/업무 분야
  organization: string // 소속 (학교/회사/기관)
  selfIntroduction: string // 간단한 자기소개
  
  // 선택적 질문들 - 민감할 수 있는 정보
  location?: string // 거주 지역
  interests?: string // 관심사/취미
  recentProjects?: string // 최근 프로젝트/연구
  careerPath?: string // 진로 여정
  adviceForJuniors?: string // 후배들에게 하고 싶은 말
  lookingFor?: string // 찾고 있는 것 (멘토/멘티/협업/정보교류 등)
  contactPreference?: string // 연락 선호 방법
  linkedIn?: string // LinkedIn 프로필
  website?: string // 개인 웹사이트/블로그
  
  createdAt: Date
  updatedAt: Date
}

export interface IntroductionFormData {
  currentStatus: string
  field: string
  organization: string
  selfIntroduction: string
  location?: string
  interests?: string
  recentProjects?: string
  careerPath?: string
  adviceForJuniors?: string
  lookingFor?: string
  contactPreference?: string
  linkedIn?: string
  website?: string
}

export const STATUS_OPTIONS = [
  { value: 'undergraduate', label: '대학생' },
  { value: 'graduate', label: '대학원생' },
  { value: 'employee', label: '직장인' },
  { value: 'entrepreneur', label: '창업가' },
  { value: 'researcher', label: '연구원' },
  { value: 'freelancer', label: '프리랜서' },
  { value: 'other', label: '기타' }
]

export const CONTACT_PREFERENCE_OPTIONS = [
  { value: 'email', label: '이메일' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'kakao', label: '카카오톡' },
  { value: 'none', label: '비공개' }
]

export const LOOKING_FOR_OPTIONS = [
  { value: 'mentor', label: '멘토 찾기' },
  { value: 'mentee', label: '멘티 찾기' },
  { value: 'collaboration', label: '협업 파트너' },
  { value: 'info-exchange', label: '정보 교류' },
  { value: 'networking', label: '네트워킹' },
  { value: 'none', label: '특별히 없음' }
]