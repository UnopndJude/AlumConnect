import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/infrastructure/auth/middleware"
import { container } from "@/infrastructure/di/container"

// POST /api/connections/[id]/respond - Respond to connection request (receiver only)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
    const { id } = await params
    const body = await request.json()
    const { action } = body

    // Validate action
    if (action !== "accept" && action !== "reject") {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid action. Must be 'accept' or 'reject'.",
        },
        { status: 400 }
      )
    }

    const connectionRepository = container.getConnectionRepository()
    const connection = await connectionRepository.findById(id)

    if (!connection) {
      return NextResponse.json(
        { success: false, message: "Connection not found." },
        { status: 404 }
      )
    }

    // Validate user is the receiver
    const userId = authResult.auth.profile.id
    if (connection.receiverId !== userId) {
      return NextResponse.json(
        {
          success: false,
          message: "Only the receiver can respond to this connection request.",
        },
        { status: 403 }
      )
    }

    // Validate connection is pending
    if (!connection.isPending) {
      return NextResponse.json(
        {
          success: false,
          message: "This connection request has already been responded to.",
        },
        { status: 400 }
      )
    }

    // Apply action
    if (action === "accept") {
      connection.accept()
    } else {
      connection.reject()
    }

    // Save updated connection
    await connectionRepository.save(connection)

    return NextResponse.json({
      success: true,
      data: connection.toPrimitives(),
    })
  } catch (error) {
    console.error("Error responding to connection:", error)
    return NextResponse.json(
      { success: false, message: "Failed to respond to connection request." },
      { status: 500 }
    )
  }
}
