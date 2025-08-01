import { NextRequest, NextResponse } from 'next/server'
import { getUserByEmail } from '@/lib/database'
import { LoginCredentials } from '@/types/user'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const body: LoginCredentials = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: '이메일과 비밀번호를 입력해주세요.' },
        { status: 400 }
      )
    }

    const user = getUserByEmail(email)
    if (!user) {
      return NextResponse.json(
        { success: false, message: '등록되지 않은 이메일입니다.' },
        { status: 401 }
      )
    }

    if (user.password !== password) {
      return NextResponse.json(
        { success: false, message: '비밀번호가 일치하지 않습니다.' },
        { status: 401 }
      )
    }

    if (user.status !== 'approved') {
      let message = '로그인할 수 없습니다.'
      if (user.status === 'pending') {
        message = '아직 관리자의 승인을 기다리고 있습니다.'
      } else if (user.status === 'rejected') {
        message = '회원가입이 거부되었습니다. 관리자에게 문의해주세요.'
      }
      
      return NextResponse.json(
        { success: false, message },
        { status: 403 }
      )
    }

    const cookieStore = await cookies()
    cookieStore.set('userId', user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/'
    })

    return NextResponse.json({
      success: true,
      message: '로그인되었습니다.',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        graduationClass: user.graduationClass,
        isAdmin: user.isAdmin
      }
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, message: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}