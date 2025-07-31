import { describe, it, expect, beforeEach, vi } from 'vitest'
import { GET, POST } from '@/app/api/introductions/route'
import { NextRequest } from 'next/server'

// Mock the cookies function
vi.mock('next/headers', () => ({
  cookies: vi.fn()
}))

// Mock the database functions
vi.mock('@/lib/database', () => ({
  getUserById: vi.fn()
}))

vi.mock('@/lib/introductions', () => ({
  createIntroduction: vi.fn(),
  getAllIntroductions: vi.fn(),
  getIntroductionByUserId: vi.fn()
}))

import { cookies } from 'next/headers'
import { getUserById } from '@/lib/database'
import { createIntroduction, getAllIntroductions, getIntroductionByUserId } from '@/lib/introductions'

const mockCookies = vi.mocked(cookies)
const mockGetUserById = vi.mocked(getUserById)
const mockCreateIntroduction = vi.mocked(createIntroduction)
const mockGetAllIntroductions = vi.mocked(getAllIntroductions)
const mockGetIntroductionByUserId = vi.mocked(getIntroductionByUserId)

describe('/api/introductions - GET', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return all introductions', async () => {
    const mockIntroductions = [
      {
        id: 'intro-1',
        userId: 'user-1',
        userName: '홍길동',
        userGraduationClass: 10,
        currentStatus: 'employee',
        field: '컴퓨터공학',
        organization: '삼성전자',
        selfIntroduction: '소프트웨어 엔지니어입니다.',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'intro-2',
        userId: 'user-2',
        userName: '김영희',
        userGraduationClass: 11,
        currentStatus: 'graduate',
        field: '생명과학',
        organization: '서울대학교',
        selfIntroduction: '생명과학 연구를 하고 있습니다.',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]

    mockGetAllIntroductions.mockReturnValue(mockIntroductions)

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.introductions).toHaveLength(2)
    expect(data.introductions[0].userName).toBe('홍길동')
    expect(data.introductions[1].userName).toBe('김영희')
  })

  it('should return empty array when no introductions exist', async () => {
    mockGetAllIntroductions.mockReturnValue([])

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.introductions).toHaveLength(0)
  })

  it('should handle server errors', async () => {
    mockGetAllIntroductions.mockImplementation(() => {
      throw new Error('Database error')
    })

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.success).toBe(false)
    expect(data.message).toBe('서버 오류가 발생했습니다.')
  })
})

describe('/api/introductions - POST', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const createMockRequest = (body: any) => {
    return new NextRequest('http://localhost:3000/api/introductions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    })
  }

  const mockCookieStore = {
    get: vi.fn()
  }

  it('should create introduction successfully', async () => {
    const requestBody = {
      currentStatus: 'employee',
      field: '컴퓨터공학',
      organization: '삼성전자',
      selfIntroduction: '소프트웨어 엔지니어입니다.',
      location: '서울',
      interests: '프로그래밍'
    }

    const mockUser = {
      id: 'user-123',
      email: 'test@example.com',
      name: '홍길동',
      graduationClass: 10,
      status: 'approved' as const,
      isAdmin: false,
      password: 'password',
      createdAt: new Date()
    }

    const mockCreatedIntroduction = {
      id: 'intro-123',
      userId: 'user-123',
      userName: '홍길동',
      userGraduationClass: 10,
      ...requestBody,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    mockCookies.mockResolvedValue(mockCookieStore)
    mockCookieStore.get.mockReturnValue({ value: 'user-123' })
    mockGetUserById.mockReturnValue(mockUser)
    mockGetIntroductionByUserId.mockReturnValue(undefined) // 기존 자기소개 없음
    mockCreateIntroduction.mockReturnValue(mockCreatedIntroduction)

    const request = createMockRequest(requestBody)
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.message).toBe('자기소개가 등록되었습니다.')
    expect(data.introduction.id).toBe('intro-123')

    expect(mockCreateIntroduction).toHaveBeenCalledWith(
      'user-123',
      '홍길동',
      10,
      requestBody
    )
  })

  it('should return error when user is not logged in', async () => {
    mockCookies.mockResolvedValue(mockCookieStore)
    mockCookieStore.get.mockReturnValue(undefined)

    const request = createMockRequest({})
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.success).toBe(false)
    expect(data.message).toBe('로그인이 필요합니다.')

    expect(mockGetUserById).not.toHaveBeenCalled()
    expect(mockCreateIntroduction).not.toHaveBeenCalled()
  })

  it('should return error when user is not approved', async () => {
    const mockUser = {
      id: 'user-123',
      email: 'test@example.com',
      name: '홍길동',
      graduationClass: 10,
      status: 'pending' as const, // 승인되지 않음
      isAdmin: false,
      password: 'password',
      createdAt: new Date()
    }

    mockCookies.mockResolvedValue(mockCookieStore)
    mockCookieStore.get.mockReturnValue({ value: 'user-123' })
    mockGetUserById.mockReturnValue(mockUser)

    const request = createMockRequest({})
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(403)
    expect(data.success).toBe(false)
    expect(data.message).toBe('승인된 회원만 자기소개를 작성할 수 있습니다.')

    expect(mockCreateIntroduction).not.toHaveBeenCalled()
  })

  it('should return error when user already has introduction', async () => {
    const mockUser = {
      id: 'user-123',
      email: 'test@example.com',
      name: '홍길동',
      graduationClass: 10,
      status: 'approved' as const,
      isAdmin: false,
      password: 'password',
      createdAt: new Date()
    }

    const existingIntroduction = {
      id: 'existing-intro',
      userId: 'user-123',
      userName: '홍길동',
      userGraduationClass: 10,
      currentStatus: 'employee',
      field: '기존 분야',
      organization: '기존 회사',
      selfIntroduction: '기존 자기소개',
      createdAt: new Date(),
      updatedAt: new Date()
    }

    mockCookies.mockResolvedValue(mockCookieStore)
    mockCookieStore.get.mockReturnValue({ value: 'user-123' })
    mockGetUserById.mockReturnValue(mockUser)
    mockGetIntroductionByUserId.mockReturnValue(existingIntroduction)

    const request = createMockRequest({})
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(409)
    expect(data.success).toBe(false)
    expect(data.message).toBe('이미 자기소개를 작성하셨습니다. 수정을 원하시면 수정 버튼을 이용해주세요.')

    expect(mockCreateIntroduction).not.toHaveBeenCalled()
  })

  it('should return error when required fields are missing', async () => {
    const mockUser = {
      id: 'user-123',
      email: 'test@example.com',
      name: '홍길동',
      graduationClass: 10,
      status: 'approved' as const,
      isAdmin: false,
      password: 'password',
      createdAt: new Date()
    }

    const requestBody = {
      currentStatus: 'employee',
      // field 누락
      organization: '삼성전자',
      selfIntroduction: '소프트웨어 엔지니어입니다.'
    }

    mockCookies.mockResolvedValue(mockCookieStore)
    mockCookieStore.get.mockReturnValue({ value: 'user-123' })
    mockGetUserById.mockReturnValue(mockUser)
    mockGetIntroductionByUserId.mockReturnValue(undefined)

    const request = createMockRequest(requestBody)
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
    expect(data.message).toBe('필수 정보를 모두 입력해주세요.')

    expect(mockCreateIntroduction).not.toHaveBeenCalled()
  })

  it('should handle server errors', async () => {
    const mockUser = {
      id: 'user-123',
      email: 'test@example.com',
      name: '홍길동',
      graduationClass: 10,
      status: 'approved' as const,
      isAdmin: false,
      password: 'password',
      createdAt: new Date()
    }

    const requestBody = {
      currentStatus: 'employee',
      field: '컴퓨터공학',
      organization: '삼성전자',
      selfIntroduction: '소프트웨어 엔지니어입니다.'
    }

    mockCookies.mockResolvedValue(mockCookieStore)
    mockCookieStore.get.mockReturnValue({ value: 'user-123' })
    mockGetUserById.mockReturnValue(mockUser)
    mockGetIntroductionByUserId.mockReturnValue(undefined)
    mockCreateIntroduction.mockImplementation(() => {
      throw new Error('Database error')
    })

    const request = createMockRequest(requestBody)
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.success).toBe(false)
    expect(data.message).toBe('서버 오류가 발생했습니다.')
  })
})