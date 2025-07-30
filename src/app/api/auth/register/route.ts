import { NextRequest, NextResponse } from 'next/server'
import { createUser, getUserByEmail } from '@/lib/database'
import { RegisterData } from '@/types/user'

export async function POST(request: NextRequest) {
  try {
    const body: RegisterData = await request.json()
    const { email, password, name, graduationClass } = body

    if (!email || !password || !name || !graduationClass) {
      return NextResponse.json(
        { success: false, message: '모든 필드를 입력해주세요.' },
        { status: 400 }
      )
    }

    if (graduationClass < 1 || graduationClass > 50) {
      return NextResponse.json(
        { success: false, message: '기수는 1기부터 50기까지 입력 가능합니다.' },
        { status: 400 }
      )
    }

    const existingUser = getUserByEmail(email)
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: '이미 등록된 이메일입니다.' },
        { status: 409 }
      )
    }

    const newUser = createUser({
      email,
      password,
      name,
      graduationClass,
      status: 'pending',
      isAdmin: false
    })

    return NextResponse.json({
      success: true,
      message: '회원가입이 완료되었습니다. 관리자의 승인을 기다려주세요.',
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        graduationClass: newUser.graduationClass,
        status: newUser.status
      }
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, message: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}