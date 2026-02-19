import { NextRequest, NextResponse } from "next/server"
import { container } from "@/infrastructure/di/container"

async function handleUnsubscribe(token: string | null) {
  if (!token) {
    return NextResponse.json(
      { success: false, message: "Unsubscribe token is required" },
      { status: 400 }
    )
  }

  const subscriptionRepository = container.getSubscriptionRepository()

  const subscription =
    await subscriptionRepository.findByUnsubscribeToken(token)

  if (!subscription) {
    return NextResponse.json(
      { success: false, message: "Invalid or expired unsubscribe link" },
      { status: 404 }
    )
  }

  if (!subscription.isActive) {
    return NextResponse.json({
      success: true,
      message: "You are already unsubscribed from the newsletter",
    })
  }

  subscription.unsubscribe()
  await subscriptionRepository.save(subscription)

  return NextResponse.json({
    success: true,
    message: "Successfully unsubscribed from newsletter",
  })
}

export async function GET(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get("token")
    return await handleUnsubscribe(token)
  } catch (error) {
    console.error("Newsletter unsubscribe error:", error)
    return NextResponse.json(
      { success: false, message: "Failed to unsubscribe from newsletter" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const token = body.token ?? null
    return await handleUnsubscribe(token)
  } catch (error) {
    console.error("Newsletter unsubscribe error:", error)
    return NextResponse.json(
      { success: false, message: "Failed to unsubscribe from newsletter" },
      { status: 500 }
    )
  }
}
