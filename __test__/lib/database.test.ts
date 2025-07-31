import { describe, it, expect, beforeEach } from 'vitest'
import { 
  getUserByEmail, 
  getUserById, 
  createUser, 
  updateUserStatus, 
  getPendingUsers,
  getAllUsers 
} from '@/lib/database'
import { User } from '@/types/user'

// 테스트용 사용자 데이터 초기화
const resetDatabase = () => {
  // database.ts의 users 배열을 초기화하기 위해 모든 사용자를 제거
  const allUsers = getAllUsers()
  allUsers.length = 0
  
  // 기본 관리자 계정 추가
  createUser({
    email: 'admin@test.com',
    password: 'admin123',
    name: '테스트 관리자',
    graduationClass: 1,
    status: 'approved',
    isAdmin: true
  })
}

describe('Database Operations', () => {
  beforeEach(() => {
    resetDatabase()
  })

  describe('createUser', () => {
    it('should create a new user with valid data', () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        name: '홍길동',
        graduationClass: 10,
        status: 'pending' as const,
        isAdmin: false
      }

      const user = createUser(userData)

      expect(user).toBeDefined()
      expect(user.email).toBe(userData.email)
      expect(user.name).toBe(userData.name)
      expect(user.graduationClass).toBe(userData.graduationClass)
      expect(user.status).toBe(userData.status)
      expect(user.isAdmin).toBe(userData.isAdmin)
      expect(user.id).toBeDefined()
      expect(user.createdAt).toBeInstanceOf(Date)
    })

    it('should generate unique IDs for different users', () => {
      const user1 = createUser({
        email: 'user1@example.com',
        password: 'password123',
        name: '사용자1',
        graduationClass: 10,
        status: 'pending',
        isAdmin: false
      })

      const user2 = createUser({
        email: 'user2@example.com',
        password: 'password123',
        name: '사용자2',
        graduationClass: 11,
        status: 'pending',
        isAdmin: false
      })

      expect(user1.id).not.toBe(user2.id)
    })
  })

  describe('getUserByEmail', () => {
    it('should return user when email exists', () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        name: '홍길동',
        graduationClass: 10,
        status: 'pending' as const,
        isAdmin: false
      }

      createUser(userData)
      const foundUser = getUserByEmail('test@example.com')

      expect(foundUser).toBeDefined()
      expect(foundUser?.email).toBe('test@example.com')
      expect(foundUser?.name).toBe('홍길동')
    })

    it('should return undefined when email does not exist', () => {
      const foundUser = getUserByEmail('nonexistent@example.com')
      expect(foundUser).toBeUndefined()
    })

    it('should be case sensitive', () => {
      createUser({
        email: 'test@example.com',
        password: 'password123',
        name: '홍길동',
        graduationClass: 10,
        status: 'pending',
        isAdmin: false
      })

      const foundUser = getUserByEmail('TEST@EXAMPLE.COM')
      expect(foundUser).toBeUndefined()
    })
  })

  describe('getUserById', () => {
    it('should return user when ID exists', () => {
      const user = createUser({
        email: 'test@example.com',
        password: 'password123',
        name: '홍길동',
        graduationClass: 10,
        status: 'pending',
        isAdmin: false
      })

      const foundUser = getUserById(user.id)

      expect(foundUser).toBeDefined()
      expect(foundUser?.id).toBe(user.id)
      expect(foundUser?.email).toBe('test@example.com')
    })

    it('should return undefined when ID does not exist', () => {
      const foundUser = getUserById('nonexistent-id')
      expect(foundUser).toBeUndefined()
    })
  })

  describe('updateUserStatus', () => {
    it('should update user status to approved', () => {
      const user = createUser({
        email: 'test@example.com',
        password: 'password123',
        name: '홍길동',
        graduationClass: 10,
        status: 'pending',
        isAdmin: false
      })

      const updatedUser = updateUserStatus(user.id, 'approved')

      expect(updatedUser).toBeDefined()
      expect(updatedUser?.status).toBe('approved')
      expect(updatedUser?.approvedAt).toBeInstanceOf(Date)
      expect(updatedUser?.rejectedAt).toBeUndefined()
    })

    it('should update user status to rejected', () => {
      const user = createUser({
        email: 'test@example.com',
        password: 'password123',
        name: '홍길동',
        graduationClass: 10,
        status: 'pending',
        isAdmin: false
      })

      const updatedUser = updateUserStatus(user.id, 'rejected')

      expect(updatedUser).toBeDefined()
      expect(updatedUser?.status).toBe('rejected')
      expect(updatedUser?.rejectedAt).toBeInstanceOf(Date)
      expect(updatedUser?.approvedAt).toBeUndefined()
    })

    it('should return null when user ID does not exist', () => {
      const result = updateUserStatus('nonexistent-id', 'approved')
      expect(result).toBeNull()
    })
  })

  describe('getPendingUsers', () => {
    it('should return only users with pending status', () => {
      // 다양한 상태의 사용자 생성
      const pendingUser1 = createUser({
        email: 'pending1@example.com',
        password: 'password123',
        name: '대기자1',
        graduationClass: 10,
        status: 'pending',
        isAdmin: false
      })

      const pendingUser2 = createUser({
        email: 'pending2@example.com',
        password: 'password123',
        name: '대기자2',
        graduationClass: 11,
        status: 'pending',
        isAdmin: false
      })

      const approvedUser = createUser({
        email: 'approved@example.com',
        password: 'password123',
        name: '승인됨',
        graduationClass: 12,
        status: 'approved',
        isAdmin: false
      })

      const pendingUsers = getPendingUsers()

      expect(pendingUsers).toHaveLength(2)
      expect(pendingUsers.map(u => u.id)).toContain(pendingUser1.id)
      expect(pendingUsers.map(u => u.id)).toContain(pendingUser2.id)
      expect(pendingUsers.map(u => u.id)).not.toContain(approvedUser.id)
    })

    it('should return empty array when no pending users exist', () => {
      const pendingUsers = getPendingUsers()
      expect(pendingUsers).toHaveLength(0)
    })
  })

  describe('getAllUsers', () => {
    it('should return all users including admin', () => {
      createUser({
        email: 'test1@example.com',
        password: 'password123',
        name: '사용자1',
        graduationClass: 10,
        status: 'pending',
        isAdmin: false
      })

      createUser({
        email: 'test2@example.com',
        password: 'password123',
        name: '사용자2',
        graduationClass: 11,
        status: 'approved',
        isAdmin: false
      })

      const allUsers = getAllUsers()
      
      // 관리자 + 생성한 2명의 사용자 = 3명
      expect(allUsers).toHaveLength(3)
      
      // 관리자 계정이 포함되어 있는지 확인
      const adminUser = allUsers.find(u => u.email === 'admin@test.com')
      expect(adminUser).toBeDefined()
      expect(adminUser?.isAdmin).toBe(true)
    })
  })
})