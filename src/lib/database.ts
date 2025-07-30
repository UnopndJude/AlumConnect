import { User } from '@/types/user'

let users: User[] = [
  {
    id: 'admin-1',
    email: 'admin@incheon-sci.hs.kr',
    password: 'admin123',
    name: '관리자',
    graduationClass: 1,
    status: 'approved',
    createdAt: new Date(),
    approvedAt: new Date(),
    isAdmin: true
  }
]

export const getUserByEmail = (email: string): User | undefined => {
  return users.find(user => user.email === email)
}

export const getUserById = (id: string): User | undefined => {
  return users.find(user => user.id === id)
}

export const createUser = (userData: Omit<User, 'id' | 'createdAt'>): User => {
  const newUser: User = {
    ...userData,
    id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date()
  }
  users.push(newUser)
  return newUser
}

export const updateUserStatus = (userId: string, status: User['status']): User | null => {
  const userIndex = users.findIndex(user => user.id === userId)
  if (userIndex === -1) return null
  
  users[userIndex] = {
    ...users[userIndex],
    status,
    ...(status === 'approved' && { approvedAt: new Date() }),
    ...(status === 'rejected' && { rejectedAt: new Date() })
  }
  
  return users[userIndex]
}

export const getPendingUsers = (): User[] => {
  return users.filter(user => user.status === 'pending')
}

export const getAllUsers = (): User[] => {
  return users
}