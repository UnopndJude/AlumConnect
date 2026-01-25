import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { container } from "@/infrastructure/di/container"
import { UserId } from "@/domain/user/value-objects"
import {
  GetAllQuestionsUseCase,
  CreateQuestionUseCase,
} from "@/application/quiz/use-cases/ManageQuizQuestions"

export async function GET() {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get("userId")?.value

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "로그인이 필요합니다." },
        { status: 401 }
      )
    }

    const userRepo = container.getUserRepository()
    const user = await userRepo.findById(UserId.create(userId))

    if (!user || !user.isAdmin) {
      return NextResponse.json(
        { success: false, message: "관리자 권한이 필요합니다." },
        { status: 403 }
      )
    }

    const useCase = new GetAllQuestionsUseCase(
      container.getQuizQuestionRepository()
    )
    const result = await useCase.execute()

    return NextResponse.json({
      success: true,
      ...result,
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

    const userRepo = container.getUserRepository()
    const user = await userRepo.findById(UserId.create(userId))

    if (!user || !user.isAdmin) {
      return NextResponse.json(
        { success: false, message: "관리자 권한이 필요합니다." },
        { status: 403 }
      )
    }

    const body = await request.json()
    const useCase = new CreateQuestionUseCase(
      container.getQuizQuestionRepository()
    )
    const result = await useCase.execute(body)

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.error.message },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "문제가 추가되었습니다.",
      question: result.value,
    })
  } catch {
    return NextResponse.json(
      { success: false, message: "서버 오류가 발생했습니다." },
      { status: 500 }
    )
  }
}
