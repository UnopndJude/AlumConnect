import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { container } from "@/infrastructure/di/container"
import { LoginUserUseCase } from "@/application/user/use-cases/LoginUser"
import { LoginUserDto } from "@/application/user/dtos/UserDto"

export async function POST(request: NextRequest) {
  try {
    const body: LoginUserDto = await request.json()

    const useCase = new LoginUserUseCase(
      container.getUserRepository(),
      container.getPasswordHasher()
    )

    const result = await useCase.execute(body)

    if (!result.success) {
      const statusCode =
        result.error.name === "UnauthorizedError"
          ? 401
          : result.error.name === "ForbiddenError"
            ? 403
            : 400
      return NextResponse.json(
        { success: false, message: result.error.message },
        { status: statusCode }
      )
    }

    const cookieStore = await cookies()
    cookieStore.set("userId", result.value.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    })

    return NextResponse.json({
      success: true,
      message: "로그인되었습니다.",
      user: result.value,
    })
  } catch {
    return NextResponse.json(
      { success: false, message: "서버 오류가 발생했습니다." },
      { status: 500 }
    )
  }
}
