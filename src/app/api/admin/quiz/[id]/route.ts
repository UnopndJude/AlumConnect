import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { container } from "@/infrastructure/di/container"
import { UserId } from "@/domain/user/value-objects"
import {
  UpdateQuestionUseCase,
  DeleteQuestionUseCase,
} from "@/application/quiz/use-cases/ManageQuizQuestions"

interface RouteContext {
  params: Promise<{ id: string }>
}

async function checkAdmin() {
  const cookieStore = await cookies()
  const userId = cookieStore.get("userId")?.value

  if (!userId) {
    return { error: "로그인이 필요합니다.", status: 401 }
  }

  const userRepo = container.getUserRepository()
  const user = await userRepo.findById(UserId.create(userId))

  if (!user || !user.isAdmin) {
    return { error: "관리자 권한이 필요합니다.", status: 403 }
  }

  return { user }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const authResult = await checkAdmin()
    if ("error" in authResult) {
      return NextResponse.json(
        { success: false, message: authResult.error },
        { status: authResult.status }
      )
    }

    const { id } = await context.params
    const body = await request.json()

    const useCase = new UpdateQuestionUseCase(
      container.getQuizQuestionRepository()
    )
    const result = await useCase.execute(id, body)

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.error.message },
        { status: result.error.name === "NotFoundError" ? 404 : 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "문제가 수정되었습니다.",
      question: result.value,
    })
  } catch {
    return NextResponse.json(
      { success: false, message: "서버 오류가 발생했습니다." },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const authResult = await checkAdmin()
    if ("error" in authResult) {
      return NextResponse.json(
        { success: false, message: authResult.error },
        { status: authResult.status }
      )
    }

    const { id } = await context.params

    const useCase = new DeleteQuestionUseCase(
      container.getQuizQuestionRepository()
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
      message: "문제가 삭제되었습니다.",
    })
  } catch {
    return NextResponse.json(
      { success: false, message: "서버 오류가 발생했습니다." },
      { status: 500 }
    )
  }
}
