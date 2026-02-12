import { NextRequest, NextResponse } from "next/server"
import { container } from "@/infrastructure/di/container"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const token = searchParams.get("token")

    if (!token) {
      return NextResponse.json(
        { error: "Unsubscribe token is required" },
        { status: 400 }
      )
    }

    const subscriptionRepository = container.getSubscriptionRepository()

    // Find subscription by token
    const subscription =
      await subscriptionRepository.findByUnsubscribeToken(token)

    if (!subscription) {
      return NextResponse.json(
        { error: "Invalid or expired unsubscribe link" },
        { status: 404 }
      )
    }

    if (!subscription.isActive) {
      return NextResponse.json({
        message: "You are already unsubscribed from the newsletter",
      })
    }

    // Unsubscribe
    subscription.unsubscribe()
    await subscriptionRepository.save(subscription)

    return NextResponse.json({
      message: "Successfully unsubscribed from newsletter",
    })
  } catch (error) {
    console.error("Newsletter unsubscribe error:", error)
    return NextResponse.json(
      { error: "Failed to unsubscribe from newsletter" },
      { status: 500 }
    )
  }
}
