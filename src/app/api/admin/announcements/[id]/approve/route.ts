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
    const announcementRepository = container.getAnnouncementRepository()
    const announcement = await announcementRepository.findById(id)

    if (!announcement) {
      return NextResponse.json(
        { success: false, message: "Announcement not found." },
        { status: 404 }
      )
    }

    // Approve the announcement
    announcement.approve(authResult.auth.profile.id)

    // Save the updated announcement
    await announcementRepository.save(announcement)

    return NextResponse.json({
      success: true,
      data: announcement.toPrimitives(),
    })
  } catch (error) {
    console.error("Error approving announcement:", error)
    return NextResponse.json(
      { success: false, message: "공지사항 승인 중 오류가 발생했습니다." },
      { status: 500 }
    )
  }
}
