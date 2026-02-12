import { NextResponse } from "next/server"
import { requireAdmin } from "@/infrastructure/auth/middleware"
import { container } from "@/infrastructure/di/container"

export async function GET() {
  const authResult = await requireAdmin()
  if (!authResult.success) {
    return authResult.response
  }

  try {
    const announcementRepository = container.getAnnouncementRepository()
    const pendingAnnouncements = await announcementRepository.findPending()

    return NextResponse.json({
      success: true,
      data: pendingAnnouncements.map((a) => a.toPrimitives()),
    })
  } catch (error) {
    console.error("Error fetching pending announcements:", error)
    return NextResponse.json(
      { success: false, message: "Failed to fetch pending announcements." },
      { status: 500 }
    )
  }
}
