import { describe, it, expect, beforeEach, vi } from 'vitest'
import { POST } from '@/app/api/auth/register/route'
import { NextRequest } from 'next/server'

// Mock the database functions
vi.mock('@/lib/database', () => ({
  getUserByEmail: vi.fn(),
  createUser: vi.fn()
}))

import { getUserByEmail, createUser } from '@/lib/database'

const mockGetUserByEmail = vi.mocked(getUserByEmail)
const mockCreateUser = vi.mocked(createUser)

describe('/api/auth/register', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const createMockRequest = (body: any) => {
    return new NextRequest('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    })
  }

  it('should register a new user successfully', async () => {
    const requestBody = {
      email: 'test@example.com',
      password: 'password123',
      name: '홍길동',
      graduationClass: 10
    }

    mockGetUserByEmail.mockReturnValue(undefined) // 기존 사용자 없음
    mockCreateUser.mockReturnValue({
      id: 'user-123',
      email: 'test@example.com',
      password: 'password123',
      name: '홍길동',
      graduationClass: 10,
      status: 'pending',
      createdAt: new Date(),
      isAdmin: false
    })

    const request = createMockRequest(requestBody)
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.message).toBe('회원가입이 완료되었습니다. 관리자의 승인을 기다려주세요.')
    expect(data.user).toEqual({
      id: 'user-123',
      email: 'test@example.com',
      name: '홍길동',
      graduationClass: 10,
      status: 'pending'
    })

    expect(mockGetUserByEmail).toHaveBeenCalledWith('test@example.com')
    expect(mockCreateUser).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
      name: '홍길동',
      graduationClass: 10,
      status: 'pending',
      isAdmin: false
    })
  })

  it('should return error when required fields are missing', async () => {
    const requestBody = {
      email: 'test@example.com',
      // password 누락
      name: '홍길동',
      graduationClass: 10
    }

    const request = createMockRequest(requestBody)
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
    expect(data.message).toBe('모든 필드를 입력해주세요.')

    expect(mockGetUserByEmail).not.toHaveBeenCalled()
    expect(mockCreateUser).not.toHaveBeenCalled()
  })

  it('should return error when graduation class is out of range', async () => {
    const requestBody = {
      email: 'test@example.com',
      password: 'password123',
      name: '홍길동',
      graduationClass: 100 // 범위 초과
    }

    const request = createMockRequest(requestBody)
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
    expect(data.message).toBe('기수는 1기부터 50기까지 입력 가능합니다.')

    expect(mockGetUserByEmail).not.toHaveBeenCalled()
    expect(mockCreateUser).not.toHaveBeenCalled()
  })

  it('should return error when user already exists', async () => {
    const requestBody = {
      email: 'existing@example.com',
      password: 'password123',
      name: '홍길동',
      graduationClass: 10
    }

    mockGetUserByEmail.mockReturnValue({
      id: 'existing-user',
      email: 'existing@example.com',
      password: 'somepassword',
      name: '기존사용자',
      graduationClass: 9,
      status: 'approved',
      createdAt: new Date(),
      isAdmin: false
    })

    const request = createMockRequest(requestBody)
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(409)
    expect(data.success).toBe(false)
    expect(data.message).toBe('이미 등록된 이메일입니다.')

    expect(mockGetUserByEmail).toHaveBeenCalledWith('existing@example.com')
    expect(mockCreateUser).not.toHaveBeenCalled()
  })

  it('should handle invalid JSON gracefully', async () => {
    const request = new NextRequest('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: 'invalid json'
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.success).toBe(false)
    expect(data.message).toBe('서버 오류가 발생했습니다.')
  })

  it('should validate graduation class minimum value', async () => {
    const requestBody = {
      email: 'test@example.com',
      password: 'password123',
      name: '홍길동',
      graduationClass: 0 // 최소값 미만
    }

    const request = createMockRequest(requestBody)
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
    expect(data.message).toBe('기수는 1기부터 50기까지 입력 가능합니다.')
  })

  it('should handle empty request body', async () => {
    const request = createMockRequest({})
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
    expect(data.message).toBe('모든 필드를 입력해주세요.')
  })

  it('should trim and validate email field', async () => {
    const requestBody = {
      email: '  test@example.com  ', // 공백 포함
      password: 'password123',
      name: '홍길동',
      graduationClass: 10
    }

    mockGetUserByEmail.mockReturnValue(undefined)
    mockCreateUser.mockReturnValue({
      id: 'user-123',
      email: '  test@example.com  ',
      password: 'password123',
      name: '홍길동',
      graduationClass: 10,
      status: 'pending',
      createdAt: new Date(),
      isAdmin: false
    })

    const request = createMockRequest(requestBody)
    const response = await POST(request)

    expect(response.status).toBe(200)
    expect(mockGetUserByEmail).toHaveBeenCalledWith('  test@example.com  ')
  })
})