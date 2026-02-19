import { NextRequest, NextResponse } from "next/server"
import { container } from "@/infrastructure/di/container"
import { Subscription } from "@/domain/subscription/entities/Subscription"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { success: false, message: "Email is required" },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, message: "Invalid email format" },
        { status: 400 }
      )
    }

    const subscriptionRepository = container.getSubscriptionRepository()

    // Check if subscription already exists
    const existingSubscription = await subscriptionRepository.findByEmail(email)

    if (existingSubscription) {
      if (existingSubscription.isActive) {
        return NextResponse.json({
          success: true,
          message: "You are already subscribed to our newsletter",
        })
      } else {
        existingSubscription.resubscribe()
        await subscriptionRepository.save(existingSubscription)
        return NextResponse.json({
          success: true,
          message: "Successfully resubscribed to newsletter",
        })
      }
    }

    // Create new subscription
    const newSubscription = Subscription.create(email)
    await subscriptionRepository.save(newSubscription)

    return NextResponse.json({
      success: true,
      message: "Successfully subscribed to newsletter",
    })
  } catch (error) {
    console.error("Newsletter subscription error:", error)
    return NextResponse.json(
      { success: false, message: "Failed to subscribe to newsletter" },
      { status: 500 }
    )
  }
}
