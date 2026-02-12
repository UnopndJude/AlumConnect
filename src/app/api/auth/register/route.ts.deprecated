import { NextRequest, NextResponse } from "next/server"
import { container } from "@/infrastructure/di/container"
import { RegisterUserUseCase } from "@/application/user/use-cases/RegisterUser"
import { RegisterData } from "@/types/user"

export async function POST(request: NextRequest) {
  try {
    const body: RegisterData = await request.json()
    const { email, password, name, graduationClass } = body

    if (!email || !password || !name || !graduationClass) {
      return NextResponse.json(
        { success: false, message: "모든 필드를 입력해주세요." },
        { status: 400 }
      )
    }

    if (graduationClass < 1 || graduationClass > 50) {
      return NextResponse.json(
        { success: false, message: "기수는 1기부터 50기까지 입력 가능합니다." },
        { status: 400 }
      )
    }

    const useCase = new RegisterUserUseCase(
      container.getUserRepository(),
      container.getPasswordHasher()
    )

    const result = await useCase.execute(
      { email, password, name, graduationClass },
      { autoApprove: false }
    )

    if (!result.success) {
      const statusCode = result.error.message.includes("이미 등록된")
        ? 409
        : 400
      return NextResponse.json(
        { success: false, message: result.error.message },
        { status: statusCode }
      )
    }

    return NextResponse.json({
      success: true,
      message: "회원가입이 완료되었습니다. 관리자의 승인을 기다려주세요.",
      user: {
        id: result.value.user.id,
        email: result.value.user.email,
        name: result.value.user.name,
        graduationClass: result.value.user.graduationClass,
        status: result.value.user.status,
      },
    })
  } catch {
    return NextResponse.json(
      { success: false, message: "서버 오류가 발생했습니다." },
      { status: 500 }
    )
  }
}
