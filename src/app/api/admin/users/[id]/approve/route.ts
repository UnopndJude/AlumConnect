import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { container } from "@/infrastructure/di/container"
import { ApproveUserUseCase } from "@/application/user/use-cases/ApproveUser"
import { UserId } from "@/domain/user/value-objects"

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const cookieStore = await cookies()
    const adminUserId = cookieStore.get("userId")?.value

    if (!adminUserId) {
      return NextResponse.json(
        { success: false, message: "로그인이 필요합니다." },
        { status: 401 }
      )
    }

    const userRepo = container.getUserRepository()
    const adminUser = await userRepo.findById(UserId.create(adminUserId))

    if (!adminUser || !adminUser.isAdmin) {
      return NextResponse.json(
        { success: false, message: "관리자 권한이 필요합니다." },
        { status: 403 }
      )
    }

    const { id } = await context.params
    const useCase = new ApproveUserUseCase(userRepo)
    const result = await useCase.execute(id)

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.error.message },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "사용자가 승인되었습니다.",
      user: result.value,
    })
  } catch {
    return NextResponse.json(
      { success: false, message: "서버 오류가 발생했습니다." },
      { status: 500 }
    )
  }
}
