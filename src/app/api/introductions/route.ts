import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { container } from "@/infrastructure/di/container"
import { UserId } from "@/domain/user/value-objects"
import {
  CreateIntroductionUseCase,
  GetIntroductionsUseCase,
} from "@/application/introduction/use-cases/IntroductionUseCases"
import { IntroductionFormData } from "@/types/introduction"

export async function GET() {
  try {
    const useCase = new GetIntroductionsUseCase(
      container.getIntroductionRepository()
    )
    const introductions = await useCase.execute()

    return NextResponse.json({
      success: true,
      introductions,
    })
  } catch {
    return NextResponse.json(
      { success: false, message: "서버 오류가 발생했습니다." },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get("userId")?.value

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "로그인이 필요합니다." },
        { status: 401 }
      )
    }

    const userRepository = container.getUserRepository()
    const user = await userRepository.findById(UserId.create(userId))

    if (!user) {
      return NextResponse.json(
        { success: false, message: "사용자를 찾을 수 없습니다." },
        { status: 404 }
      )
    }

    if (!user.status.isApproved()) {
      return NextResponse.json(
        {
          success: false,
          message: "승인된 회원만 자기소개를 작성할 수 있습니다.",
        },
        { status: 403 }
      )
    }

    const body: IntroductionFormData = await request.json()

    if (!body.status || !body.selfIntroduction) {
      return NextResponse.json(
        { success: false, message: "필수 정보를 모두 입력해주세요." },
        { status: 400 }
      )
    }

    const useCase = new CreateIntroductionUseCase(
      container.getIntroductionRepository(),
      container.getUserRepository()
    )

    const userPrimitives = user.toPrimitives()

    const result = await useCase.execute({
      userId,
      name: body.name || userPrimitives.name,
      graduationClass: body.graduationClass || userPrimitives.graduationClass,
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
      const statusCode = result.error.message.includes("이미") ? 409 : 400
      return NextResponse.json(
        { success: false, message: result.error.message },
        { status: statusCode }
      )
    }

    return NextResponse.json({
      success: true,
      message: "자기소개가 등록되었습니다.",
      introduction: result.value,
    })
  } catch {
    return NextResponse.json(
      { success: false, message: "서버 오류가 발생했습니다." },
      { status: 500 }
    )
  }
}
