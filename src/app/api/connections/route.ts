import { NextRequest, NextResponse } from "next/server"
import { requireVerified, requireAuth } from "@/infrastructure/auth/middleware"
import { container } from "@/infrastructure/di/container"
import { Connection } from "@/domain/connection"
import { ProfileId } from "@/domain/profile"

// POST /api/connections - Send connection request (verified users only)
export async function POST(request: NextRequest) {
  const authResult = await requireVerified()
  if (!authResult.success) {
    return authResult.response
  }

  try {
    const body = await request.json()
    const { receiverId, message } = body

    // Validate required fields
    if (!receiverId) {
      return NextResponse.json(
        { success: false, message: "receiverId is required." },
        { status: 400 }
      )
    }

    // Validate receiver is different from sender
    if (receiverId === authResult.auth.profile.id) {
      return NextResponse.json(
        { success: false, message: "Cannot send connection request to yourself." },
        { status: 400 }
      )
    }

    const connectionRepository = container.getConnectionRepository()
    const profileRepository = container.getProfileRepository()

    // Validate receiver exists
    const receiver = await profileRepository.findById(ProfileId.create(receiverId))
    if (!receiver) {
      return NextResponse.json(
        { success: false, message: "Receiver not found." },
        { status: 404 }
      )
    }

    // Check if connection already exists
    const existingConnection = await connectionRepository.findBetweenUsers(
      authResult.auth.profile.id,
      receiverId
    )
    if (existingConnection) {
      return NextResponse.json(
        { success: false, message: "Connection already exists between these users." },
        { status: 409 }
      )
    }

    // Create connection
    const connection = Connection.create({
      requesterId: authResult.auth.profile.id,
      receiverId,
      message: message || null,
    })

    // Save connection
    await connectionRepository.save(connection)

    return NextResponse.json({
      success: true,
      data: connection.toPrimitives(),
    })
  } catch (error) {
    console.error("Error creating connection:", error)
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to create connection request.",
      },
      { status: 500 }
    )
  }
}

// GET /api/connections - Get user's connections
export async function GET(request: NextRequest) {
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
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")

    const connectionRepository = container.getConnectionRepository()
    let connections: Connection[] = []

    if (status === "pending") {
      // Get pending connections received by user
      connections = await connectionRepository.findPendingForUser(
        authResult.auth.profile.id
      )
    } else if (status === "accepted") {
      // Get accepted connections
      connections = await connectionRepository.findAcceptedConnections(
        authResult.auth.profile.id
      )
    } else if (status === "rejected") {
      // Get rejected connections (received)
      const received = await connectionRepository.findByReceiverId(
        authResult.auth.profile.id
      )
      connections = received.filter((c) => c.status === "rejected")
    } else {
      // Get all connections where user is requester or receiver
      const sent = await connectionRepository.findByRequesterId(
        authResult.auth.profile.id
      )
      const received = await connectionRepository.findByReceiverId(
        authResult.auth.profile.id
      )
      connections = [...sent, ...received]
    }

    return NextResponse.json({
      success: true,
      data: connections.map((c) => c.toPrimitives()),
    })
  } catch (error) {
    console.error("Error fetching connections:", error)
    return NextResponse.json(
      { success: false, message: "Failed to fetch connections." },
      { status: 500 }
    )
  }
}
