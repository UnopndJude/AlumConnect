import { NextRequest, NextResponse } from "next/server"
import { container } from "@/infrastructure/di/container"
import { SubmitQuizAnswersUseCase } from "@/application/quiz/use-cases/SubmitQuizAnswers"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const useCase = new SubmitQuizAnswersUseCase(
      container.getQuizSessionRepository(),
      container.getQuizQuestionRepository(),
      container.getQuizGradingService(),
      container.getQuizConfig()
    )

    const result = await useCase.execute(body)

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(result.value)
  } catch {
    return NextResponse.json(
      { success: false, message: "서버 오류가 발생했습니다." },
      { status: 500 }
    )
  }
}
