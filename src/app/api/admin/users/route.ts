import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { container } from "@/infrastructure/di/container"
import { GetPendingUsersUseCase } from "@/application/user/use-cases/ApproveUser"
import { UserId } from "@/domain/user/value-objects"

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

    const useCase = new GetPendingUsersUseCase(userRepo)
    const users = await useCase.execute()

    return NextResponse.json({
      success: true,
      users,
    })
  } catch {
    return NextResponse.json(
      { success: false, message: "서버 오류가 발생했습니다." },
      { status: 500 }
    )
  }
}
