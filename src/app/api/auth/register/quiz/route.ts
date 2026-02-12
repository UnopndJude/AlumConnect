import { NextRequest, NextResponse } from "next/server"
import { container } from "@/infrastructure/di/container"
import { StartQuizSessionUseCase } from "@/application/quiz/use-cases/StartQuizSession"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const useCase = new StartQuizSessionUseCase(
      container.getQuizQuestionRepository(),
      container.getQuizSessionRepository(),
      container.getQuizConfig()
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
      ...result.value,
      message: "퀴즈를 시작합니다. 5문제 중 4문제 이상 맞추셔야 합니다.",
    })
  } catch (error) {
    console.error("Quiz API error:", error)
    return NextResponse.json(
      { success: false, message: "서버 오류가 발생했습니다." },
      { status: 500 }
    )
  }
}
