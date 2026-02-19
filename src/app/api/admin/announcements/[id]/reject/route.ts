import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/infrastructure/auth/middleware"
import { container } from "@/infrastructure/di/container"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAdmin()
  if (!authResult.success) {
    return authResult.response
  }

  try {
    const { id } = await params
    const body = await request.json()
    const { reason } = body

    if (!reason || typeof reason !== "string" || reason.trim().length === 0) {
      return NextResponse.json(
        { success: false, message: "Rejection reason is required." },
        { status: 400 }
      )
    }

    const announcementRepository = container.getAnnouncementRepository()
    const announcement = await announcementRepository.findById(id)

    if (!announcement) {
      return NextResponse.json(
        { success: false, message: "Announcement not found." },
        { status: 404 }
      )
    }

    // Reject the announcement
    announcement.reject(authResult.auth.profile.id, reason)

    // Save the updated announcement
    await announcementRepository.save(announcement)

    return NextResponse.json({
      success: true,
      data: announcement.toPrimitives(),
    })
  } catch (error) {
    console.error("Error rejecting announcement:", error)
    return NextResponse.json(
      { success: false, message: "공지사항 거부 처리 중 오류가 발생했습니다." },
      { status: 500 }
    )
  }
}
