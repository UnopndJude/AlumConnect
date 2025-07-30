import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getUserById } from '@/lib/database'
import { getIntroductionById, updateIntroduction, deleteIntroduction } from '@/lib/introductions'
import { IntroductionFormData } from '@/types/introduction'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const introduction = getIntroductionById(params.id)
    
    if (!introduction) {
      return NextResponse.json(
        { success: false, message: '자기소개를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      introduction
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, message: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
        { success: false, message: '승인된 회원만 자기소개를 수정할 수 있습니다.' },
        { status: 403 }
      )
    }

    const introduction = getIntroductionById(params.id)
    if (!introduction) {
      return NextResponse.json(
        { success: false, message: '자기소개를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // 본인의 자기소개인지 확인
    if (introduction.userId !== userId) {
      return NextResponse.json(
        { success: false, message: '본인의 자기소개만 수정할 수 있습니다.' },
        { status: 403 }
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

    const updatedIntroduction = updateIntroduction(params.id, body)

    return NextResponse.json({
      success: true,
      message: '자기소개가 수정되었습니다.',
      introduction: updatedIntroduction
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, message: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('userId')?.value

    if (!userId) {
      return NextResponse.json(
        { success: false, message: '로그인이 필요합니다.' },
        { status: 401 }
      )
    }

    const introduction = getIntroductionById(params.id)
    if (!introduction) {
      return NextResponse.json(
        { success: false, message: '자기소개를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // 본인의 자기소개인지 확인
    if (introduction.userId !== userId) {
      return NextResponse.json(
        { success: false, message: '본인의 자기소개만 삭제할 수 있습니다.' },
        { status: 403 }
      )
    }

    const deleted = deleteIntroduction(params.id)
    
    if (!deleted) {
      return NextResponse.json(
        { success: false, message: '삭제에 실패했습니다.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: '자기소개가 삭제되었습니다.'
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, message: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}