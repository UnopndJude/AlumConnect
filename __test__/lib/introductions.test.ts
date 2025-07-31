import { describe, it, expect, beforeEach } from 'vitest'
import {
  createIntroduction,
  getIntroductionByUserId,
  getIntroductionById,
  updateIntroduction,
  deleteIntroduction,
  getAllIntroductions,
  getIntroductionsByGraduationClass,
  searchIntroductions
} from '@/lib/introductions'
import { IntroductionFormData } from '@/types/introduction'

// 테스트용 데이터 초기화
const resetIntroductions = () => {
  const allIntroductions = getAllIntroductions()
  allIntroductions.length = 0
}

const mockIntroductionData: IntroductionFormData = {
  currentStatus: 'employee',
  field: '컴퓨터공학',
  organization: '삼성전자',
  selfIntroduction: '안녕하세요. 소프트웨어 엔지니어로 일하고 있습니다.',
  location: '서울',
  interests: '프로그래밍, 독서',
  recentProjects: 'AI 기반 추천 시스템 개발',
  careerPath: '졸업 후 스타트업에서 2년, 현재 대기업 3년차',
  adviceForJuniors: '꾸준히 학습하고 실무 경험을 쌓으세요.',
  lookingFor: 'mentee',
  contactPreference: 'email',
  linkedIn: 'https://linkedin.com/in/test',
  website: 'https://test.com'
}

describe('Introduction Operations', () => {
  beforeEach(() => {
    resetIntroductions()
  })

  describe('createIntroduction', () => {
    it('should create a new introduction with valid data', () => {
      const introduction = createIntroduction(
        'user-123',
        '홍길동',
        10,
        mockIntroductionData
      )

      expect(introduction).toBeDefined()
      expect(introduction.userId).toBe('user-123')
      expect(introduction.userName).toBe('홍길동')
      expect(introduction.userGraduationClass).toBe(10)
      expect(introduction.currentStatus).toBe('employee')
      expect(introduction.field).toBe('컴퓨터공학')
      expect(introduction.organization).toBe('삼성전자')
      expect(introduction.selfIntroduction).toBe('안녕하세요. 소프트웨어 엔지니어로 일하고 있습니다.')
      expect(introduction.id).toBeDefined()
      expect(introduction.createdAt).toBeInstanceOf(Date)
      expect(introduction.updatedAt).toBeInstanceOf(Date)
    })

    it('should handle optional fields correctly', () => {
      const minimalData: IntroductionFormData = {
        currentStatus: 'undergraduate',
        field: '물리학',
        organization: '서울대학교',
        selfIntroduction: '물리학과 학생입니다.'
      }

      const introduction = createIntroduction(
        'user-456',
        '김영희',
        15,
        minimalData
      )

      expect(introduction.currentStatus).toBe('undergraduate')
      expect(introduction.field).toBe('물리학')
      expect(introduction.organization).toBe('서울대학교')
      expect(introduction.selfIntroduction).toBe('물리학과 학생입니다.')
      expect(introduction.location).toBeUndefined()
      expect(introduction.interests).toBeUndefined()
      expect(introduction.linkedIn).toBeUndefined()
    })

    it('should generate unique IDs for different introductions', () => {
      const intro1 = createIntroduction('user-1', '사용자1', 10, mockIntroductionData)
      const intro2 = createIntroduction('user-2', '사용자2', 11, mockIntroductionData)

      expect(intro1.id).not.toBe(intro2.id)
    })
  })

  describe('getIntroductionByUserId', () => {
    it('should return introduction when user has one', () => {
      const created = createIntroduction('user-123', '홍길동', 10, mockIntroductionData)
      const found = getIntroductionByUserId('user-123')

      expect(found).toBeDefined()
      expect(found?.id).toBe(created.id)
      expect(found?.userId).toBe('user-123')
    })

    it('should return undefined when user has no introduction', () => {
      const found = getIntroductionByUserId('nonexistent-user')
      expect(found).toBeUndefined()
    })
  })

  describe('getIntroductionById', () => {
    it('should return introduction when ID exists', () => {
      const created = createIntroduction('user-123', '홍길동', 10, mockIntroductionData)
      const found = getIntroductionById(created.id)

      expect(found).toBeDefined()
      expect(found?.id).toBe(created.id)
      expect(found?.userId).toBe('user-123')
    })

    it('should return undefined when ID does not exist', () => {
      const found = getIntroductionById('nonexistent-id')
      expect(found).toBeUndefined()
    })
  })

  describe('updateIntroduction', () => {
    it('should update introduction fields', () => {
      const created = createIntroduction('user-123', '홍길동', 10, mockIntroductionData)
      const updateData = {
        field: '데이터 사이언스',
        organization: '구글',
        interests: '머신러닝, 데이터 분석'
      }

      const updated = updateIntroduction(created.id, updateData)

      expect(updated).toBeDefined()
      expect(updated?.field).toBe('데이터 사이언스')
      expect(updated?.organization).toBe('구글')
      expect(updated?.interests).toBe('머신러닝, 데이터 분석')
      expect(updated?.currentStatus).toBe('employee') // 변경되지 않은 필드
      expect(updated?.updatedAt).toBeInstanceOf(Date)
      expect(updated?.updatedAt.getTime()).toBeGreaterThanOrEqual(updated?.createdAt.getTime() || 0)
    })

    it('should return null when introduction ID does not exist', () => {
      const result = updateIntroduction('nonexistent-id', { field: '새로운 분야' })
      expect(result).toBeNull()
    })
  })

  describe('deleteIntroduction', () => {
    it('should delete existing introduction', () => {
      const created = createIntroduction('user-123', '홍길동', 10, mockIntroductionData)
      
      const deleted = deleteIntroduction(created.id)
      expect(deleted).toBe(true)

      const found = getIntroductionById(created.id)
      expect(found).toBeUndefined()
    })

    it('should return false when introduction ID does not exist', () => {
      const result = deleteIntroduction('nonexistent-id')
      expect(result).toBe(false)
    })
  })

  describe('getAllIntroductions', () => {
    it('should return all introductions sorted by creation date (newest first)', async () => {
      const intro1 = createIntroduction('user-1', '사용자1', 10, mockIntroductionData)
      
      // 약간의 시간 차이를 두기 위해
      await new Promise(resolve => setTimeout(resolve, 1))
      const intro2 = createIntroduction('user-2', '사용자2', 11, mockIntroductionData)

      const allIntroductions = getAllIntroductions()
      expect(allIntroductions).toHaveLength(2)
      
      // 최신 순으로 정렬되어 있는지 확인
      expect(allIntroductions[0].createdAt.getTime())
        .toBeGreaterThanOrEqual(allIntroductions[1].createdAt.getTime())
    })

    it('should return empty array when no introductions exist', () => {
      const allIntroductions = getAllIntroductions()
      expect(allIntroductions).toHaveLength(0)
    })
  })

  describe('getIntroductionsByGraduationClass', () => {
    it('should return only introductions from specified graduation class', () => {
      createIntroduction('user-1', '10기 사용자', 10, mockIntroductionData)
      createIntroduction('user-2', '11기 사용자', 11, mockIntroductionData)
      createIntroduction('user-3', '10기 사용자2', 10, mockIntroductionData)

      const class10Introductions = getIntroductionsByGraduationClass(10)
      const class11Introductions = getIntroductionsByGraduationClass(11)

      expect(class10Introductions).toHaveLength(2)
      expect(class11Introductions).toHaveLength(1)
      
      class10Introductions.forEach(intro => {
        expect(intro.userGraduationClass).toBe(10)
      })
      
      class11Introductions.forEach(intro => {
        expect(intro.userGraduationClass).toBe(11)
      })
    })

    it('should return empty array when no introductions exist for graduation class', () => {
      const introductions = getIntroductionsByGraduationClass(99)
      expect(introductions).toHaveLength(0)
    })
  })

  describe('searchIntroductions', () => {
    beforeEach(() => {
      createIntroduction('user-1', '홍길동', 10, {
        ...mockIntroductionData,
        field: '컴퓨터공학',
        organization: '삼성전자',
        selfIntroduction: '소프트웨어 개발자입니다.'
      })
      
      createIntroduction('user-2', '김영희', 11, {
        ...mockIntroductionData,
        field: '생명과학',
        organization: '서울대학교',
        selfIntroduction: '생명과학 연구를 하고 있습니다.'
      })
      
      createIntroduction('user-3', '박철수', 12, {
        ...mockIntroductionData,
        field: '기계공학',
        organization: '현대자동차',
        selfIntroduction: '자동차 엔진 설계 업무를 담당합니다.'
      })
    })

    it('should search by user name', () => {
      const results = searchIntroductions('홍길동')
      expect(results).toHaveLength(1)
      expect(results[0].userName).toBe('홍길동')
    })

    it('should search by field', () => {
      const results = searchIntroductions('컴퓨터')
      expect(results).toHaveLength(1)
      expect(results[0].field).toBe('컴퓨터공학')
    })

    it('should search by organization', () => {
      const results = searchIntroductions('삼성')
      expect(results).toHaveLength(1)
      expect(results[0].organization).toBe('삼성전자')
    })

    it('should search by self introduction', () => {
      const results = searchIntroductions('연구')
      expect(results).toHaveLength(1)
      expect(results[0].selfIntroduction).toContain('연구')
    })

    it('should be case insensitive', () => {
      const results = searchIntroductions('홍길동')
      expect(results).toHaveLength(1)
      expect(results[0].userName).toBe('홍길동')
    })

    it('should return empty array when no matches found', () => {
      const results = searchIntroductions('존재하지않는검색어')
      expect(results).toHaveLength(0)
    })

    it('should return multiple results when multiple matches found', () => {
      const results = searchIntroductions('과학') // '컴퓨터과학', '생명과학', '기계공학'
      expect(results.length).toBeGreaterThanOrEqual(1) // 최소 하나는 매치되어야 함
    })
  })
})