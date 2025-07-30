import { NextRequest, NextResponse } from 'next/server'
import { getPendingUsers, getUserById } from '@/lib/database'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('userId')?.value

    if (!userId) {
      return NextResponse.json(
        { success: false, message: '로그인이 필요합니다.' },
        { status: 401 }
      )
    }

    const user = getUserById(userId)
    if (!user || !user.isAdmin) {
      return NextResponse.json(
        { success: false, message: '관리자 권한이 필요합니다.' },
        { status: 403 }
      )
    }

    const pendingUsers = getPendingUsers()
    const sanitizedUsers = pendingUsers.map(user => ({
      id: user.id,
      email: user.email,
      name: user.name,
      graduationClass: user.graduationClass,
      status: user.status,
      createdAt: user.createdAt
    }))

    return NextResponse.json({
      success: true,
      users: sanitizedUsers
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, message: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}