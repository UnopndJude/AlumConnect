import { NextRequest, NextResponse } from "next/server"
import { container } from "@/infrastructure/di/container"
import { MatchAlumniUseCase } from "@/application/alumni/use-cases/MatchAlumni"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Check for existing user
    const userRepo = container.getUserRepository()
    const existingUser = await userRepo.findByEmailString(body.email)
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: "이미 등록된 이메일입니다." },
        { status: 409 }
      )
    }

    const useCase = new MatchAlumniUseCase(container.getAlumniMatchingService())
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
    })
  } catch {
    return NextResponse.json(
      { success: false, message: "서버 오류가 발생했습니다." },
      { status: 500 }
    )
  }
}
