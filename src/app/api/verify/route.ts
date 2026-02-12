import { NextResponse } from "next/server"
import { createServerClient } from "@/infrastructure/supabase"
import { container } from "@/infrastructure/di/container"
import { StartQuizSessionUseCase } from "@/application/quiz/use-cases/StartQuizSession"

export async function POST() {
  try {
    // Check authentication
    const supabase = await createServerClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json(
        { success: false, message: "로그인이 필요합니다." },
        { status: 401 }
      )
    }

    // Get profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", session.user.id)
      .single()

    if (!profile) {
      return NextResponse.json(
        { success: false, message: "프로필을 찾을 수 없습니다." },
        { status: 404 }
      )
    }

    if (profile.is_verified) {
      return NextResponse.json(
        {
          success: false,
          message: "이미 인증된 프로필입니다.",
          verified: true,
        },
        { status: 400 }
      )
    }

    const useCase = new StartQuizSessionUseCase(
      container.getQuizQuestionRepository(),
      container.getQuizSessionRepository(),
      container.getQuizConfig()
    )

    const result = await useCase.execute({
      email: session.user.email!,
      alumniMatched: !!profile.alumni_id,
      alumniId: profile.alumni_id || undefined,
    })

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.error.message },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      ...result.value,
      message: "인증 퀴즈를 시작합니다. 5문제 중 4문제 이상 맞추셔야 합니다.",
    })
  } catch (error) {
    console.error("Verification quiz init error:", error)
    return NextResponse.json(
      { success: false, message: "서버 오류가 발생했습니다." },
      { status: 500 }
    )
  }
}
