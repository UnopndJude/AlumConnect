import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { container } from "@/infrastructure/di/container"
import {
  GetIntroductionByIdUseCase,
  UpdateIntroductionUseCase,
  DeleteIntroductionUseCase,
} from "@/application/introduction/use-cases/IntroductionUseCases"
import { IntroductionFormData } from "@/types/introduction"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const useCase = new GetIntroductionByIdUseCase(
      container.getIntroductionRepository()
    )
    const result = await useCase.execute(id)

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.error.message },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      introduction: result.value,
    })
  } catch {
    return NextResponse.json(
      { success: false, message: "서버 오류가 발생했습니다." },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get("userId")?.value

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "로그인이 필요합니다." },
        { status: 401 }
      )
    }

    const { id } = await params
    const body: IntroductionFormData = await request.json()

    if (!body.status || !body.selfIntroduction) {
      return NextResponse.json(
        { success: false, message: "필수 정보를 모두 입력해주세요." },
        { status: 400 }
      )
    }

    const useCase = new UpdateIntroductionUseCase(
      container.getIntroductionRepository()
    )

    const result = await useCase.execute(id, userId, {
      name: body.name,
      graduationClass: body.graduationClass,
      status: body.status,
      field: body.field,
      organization: body.organization,
      location: body.location,
      selfIntroduction: body.selfIntroduction,
      lookingFor: body.lookingFor,
      interests: body.interests,
      expertise: body.expertise,
      projects: body.projects,
      contactPreference: body.contactPreference,
      contactInfo: body.contactInfo,
    })

    if (!result.success) {
      const statusCode = result.error.message.includes("본인")
        ? 403
        : result.error.message.includes("찾을")
          ? 404
          : 400
      return NextResponse.json(
        { success: false, message: result.error.message },
        { status: statusCode }
      )
    }

    return NextResponse.json({
      success: true,
      message: "자기소개가 수정되었습니다.",
      introduction: result.value,
    })
  } catch {
    return NextResponse.json(
      { success: false, message: "서버 오류가 발생했습니다." },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get("userId")?.value

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "로그인이 필요합니다." },
        { status: 401 }
      )
    }

    const { id } = await params
    const useCase = new DeleteIntroductionUseCase(
      container.getIntroductionRepository()
    )

    const result = await useCase.execute(id, userId)

    if (!result.success) {
      const statusCode = result.error.message.includes("본인")
        ? 403
        : result.error.message.includes("찾을")
          ? 404
          : 400
      return NextResponse.json(
        { success: false, message: result.error.message },
        { status: statusCode }
      )
    }

    return NextResponse.json({
      success: true,
      message: "자기소개가 삭제되었습니다.",
    })
  } catch {
    return NextResponse.json(
      { success: false, message: "서버 오류가 발생했습니다." },
      { status: 500 }
    )
  }
}
