import { NextResponse } from "next/server"
import { requireAuth } from "@/infrastructure/auth/middleware"
import { container } from "@/infrastructure/di/container"

// GET /api/connections/pending - Get pending connection requests received by current user
export async function GET() {
  const authResult = await requireAuth()
  if (!authResult.success) {
    return authResult.response
  }

  if (!authResult.auth.profile) {
    return NextResponse.json(
      { success: false, message: "Profile not found." },
      { status: 404 }
    )
  }

  try {
    const connectionRepository = container.getConnectionRepository()
    const connections = await connectionRepository.findPendingForUser(
      authResult.auth.profile.id
    )

    return NextResponse.json({
      success: true,
      data: connections.map((c) => c.toPrimitives()),
    })
  } catch (error) {
    console.error("Error fetching pending connections:", error)
    return NextResponse.json(
      { success: false, message: "Failed to fetch pending connections." },
      { status: 500 }
    )
  }
}
