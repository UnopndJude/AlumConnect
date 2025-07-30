import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getUserById } from '@/lib/database'
import { createIntroduction, getAllIntroductions, getIntroductionByUserId } from '@/lib/introductions'
import { IntroductionFormData } from '@/types/introduction'

export async function GET() {
  try {
    const introductions = getAllIntroductions()
    
    return NextResponse.json({
      success: true,
      introductions: introductions.map(intro => ({
        ...intro,
        // 민감한 정보는 선택적으로 제거할 수 있음
      }))
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, message: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
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
    if (!user || user.status !== 'approved') {
      return NextResponse.json(
        { success: false, message: '승인된 회원만 자기소개를 작성할 수 있습니다.' },
        { status: 403 }
      )
    }

    // 이미 자기소개가 있는지 확인
    const existingIntro = getIntroductionByUserId(userId)
    if (existingIntro) {
      return NextResponse.json(
        { success: false, message: '이미 자기소개를 작성하셨습니다. 수정을 원하시면 수정 버튼을 이용해주세요.' },
        { status: 409 }
      )
    }

    const body: IntroductionFormData = await request.json()
    
    // 필수 필드 검증
    if (!body.currentStatus || !body.field || !body.organization || !body.selfIntroduction) {
      return NextResponse.json(
        { success: false, message: '필수 정보를 모두 입력해주세요.' },
        { status: 400 }
      )
    }

    const newIntroduction = createIntroduction(
      user.id,
      user.name,
      user.graduationClass,
      body
    )

    return NextResponse.json({
      success: true,
      message: '자기소개가 등록되었습니다.',
      introduction: newIntroduction
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, message: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}