import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/infrastructure/auth/middleware"
import { container } from "@/infrastructure/di/container"

// GET /api/connections/[id] - Get connection by ID (parties only)
export async function GET(
  _request: NextRequest,
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
    const connectionRepository = container.getConnectionRepository()
    const connection = await connectionRepository.findById(id)

    if (!connection) {
      return NextResponse.json(
        { success: false, message: "Connection not found." },
        { status: 404 }
      )
    }

    // Check if user is requester or receiver
    const userId = authResult.auth.profile.id
    if (
      connection.requesterId !== userId &&
      connection.receiverId !== userId
    ) {
      return NextResponse.json(
        { success: false, message: "Unauthorized." },
        { status: 403 }
      )
    }

    return NextResponse.json({
      success: true,
      data: connection.toPrimitives(),
    })
  } catch (error) {
    console.error("Error fetching connection:", error)
    return NextResponse.json(
      { success: false, message: "Failed to fetch connection." },
      { status: 500 }
    )
  }
}

// DELETE /api/connections/[id] - Cancel/remove connection
export async function DELETE(
  _request: NextRequest,
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
    const connectionRepository = container.getConnectionRepository()
    const connection = await connectionRepository.findById(id)

    if (!connection) {
      return NextResponse.json(
        { success: false, message: "Connection not found." },
        { status: 404 }
      )
    }

    const userId = authResult.auth.profile.id

    // Requester can cancel pending request
    if (connection.requesterId === userId && connection.isPending) {
      await connectionRepository.delete(id)
      return NextResponse.json({
        success: true,
        message: "Connection request cancelled.",
      })
    }

    // Either party can remove accepted connection
    if (
      (connection.requesterId === userId ||
        connection.receiverId === userId) &&
      connection.isAccepted
    ) {
      await connectionRepository.delete(id)
      return NextResponse.json({
        success: true,
        message: "Connection removed.",
      })
    }

    // Otherwise, unauthorized
    return NextResponse.json(
      { success: false, message: "Unauthorized to delete this connection." },
      { status: 403 }
    )
  } catch (error) {
    console.error("Error deleting connection:", error)
    return NextResponse.json(
      { success: false, message: "Failed to delete connection." },
      { status: 500 }
    )
  }
}
