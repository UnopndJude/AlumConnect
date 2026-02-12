import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/infrastructure/auth/middleware"
import { container } from "@/infrastructure/di/container"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAuth()
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

    // Check access: owner or admin can view
    const isOwner =
      announcement.authorId === authResult.auth.profile?.id
    const isAdmin = authResult.auth.profile?.isAdmin || false

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { success: false, message: "Access denied." },
        { status: 403 }
      )
    }

    return NextResponse.json({
      success: true,
      data: announcement.toPrimitives(),
    })
  } catch (error) {
    console.error("Error fetching announcement:", error)
    return NextResponse.json(
      { success: false, message: "Failed to fetch announcement." },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAuth()
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

    // Check if user can delete (owner and pending status only)
    const profileId = authResult.auth.profile?.id || ""
    if (!announcement.canBeDeletedBy(profileId)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Only the owner can delete their own pending announcements.",
        },
        { status: 403 }
      )
    }

    await announcementRepository.delete(id)

    return NextResponse.json({
      success: true,
      message: "Announcement deleted successfully.",
    })
  } catch (error) {
    console.error("Error deleting announcement:", error)
    return NextResponse.json(
      { success: false, message: "Failed to delete announcement." },
      { status: 500 }
    )
  }
}
