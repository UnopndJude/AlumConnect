import { NextRequest, NextResponse } from "next/server"
import { requireVerified, requireAuth } from "@/infrastructure/auth/middleware"
import { container } from "@/infrastructure/di/container"
import { Announcement } from "@/domain/announcement"

export async function POST(request: NextRequest) {
  const authResult = await requireVerified()
  if (!authResult.success) {
    return authResult.response
  }

  try {
    const body = await request.json()
    const { type, title, content } = body

    // Validate required fields
    if (!type || !title || !content) {
      return NextResponse.json(
        {
          success: false,
          message: "Type, title, and content are required.",
        },
        { status: 400 }
      )
    }

    // Validate type
    const validTypes = [
      "alumni_in_media",
      "member_announcements",
      "industry_trends",
    ]
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        {
          success: false,
          message: `Invalid announcement type. Must be one of: ${validTypes.join(", ")}`,
        },
        { status: 400 }
      )
    }

    // Create announcement
    const announcement = Announcement.create({
      type,
      title,
      content,
      authorId: authResult.auth.profile.id,
    })

    // Save to repository
    const announcementRepository = container.getAnnouncementRepository()
    await announcementRepository.save(announcement)

    return NextResponse.json({
      success: true,
      data: announcement.toPrimitives(),
    })
  } catch (error) {
    console.error("Error creating announcement:", error)
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to create announcement.",
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  const authResult = await requireAuth()
  if (!authResult.success) {
    return authResult.response
  }

  try {
    const announcementRepository = container.getAnnouncementRepository()
    const announcements = await announcementRepository.findByAuthorId(
      authResult.auth.profile?.id || ""
    )

    return NextResponse.json({
      success: true,
      data: announcements.map((a) => a.toPrimitives()),
    })
  } catch (error) {
    console.error("Error fetching user announcements:", error)
    return NextResponse.json(
      { success: false, message: "Failed to fetch announcements." },
      { status: 500 }
    )
  }
}
