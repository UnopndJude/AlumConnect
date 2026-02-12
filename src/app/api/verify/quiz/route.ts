import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/infrastructure/supabase"
import { container } from "@/infrastructure/di/container"
import { VerifyProfileUseCase } from "@/application/quiz/use-cases/VerifyProfile"

export async function POST(request: NextRequest) {
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

    const body = await request.json()

    const useCase = new VerifyProfileUseCase(
      container.getQuizSessionRepository(),
      container.getQuizQuestionRepository(),
      container.getProfileRepository(),
      container.getQuizGradingService(),
      container.getQuizConfig()
    )

    const result = await useCase.execute({
      ...body,
      profileId: session.user.id,
    })

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(result.value)
  } catch (error) {
    console.error("Verification quiz error:", error)
    return NextResponse.json(
      { success: false, message: "서버 오류가 발생했습니다." },
      { status: 500 }
    )
  }
}
