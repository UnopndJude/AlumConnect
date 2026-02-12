import { NextRequest, NextResponse } from "next/server"
import { container } from "@/infrastructure/di/container"
import { Subscription } from "@/domain/subscription/entities/Subscription"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      )
    }

    const subscriptionRepository = container.getSubscriptionRepository()

    // Check if subscription already exists
    const existingSubscription = await subscriptionRepository.findByEmail(email)

    if (existingSubscription) {
      if (existingSubscription.isActive) {
        return NextResponse.json({
          message: "You are already subscribed to our newsletter",
        })
      } else {
        // Resubscribe
        existingSubscription.resubscribe()
        await subscriptionRepository.save(existingSubscription)
        return NextResponse.json({
          message: "Successfully resubscribed to newsletter",
        })
      }
    }

    // Create new subscription
    const newSubscription = Subscription.create(email)
    await subscriptionRepository.save(newSubscription)

    return NextResponse.json({
      message: "Successfully subscribed to newsletter",
    })
  } catch (error) {
    console.error("Newsletter subscription error:", error)
    return NextResponse.json(
      { error: "Failed to subscribe to newsletter" },
      { status: 500 }
    )
  }
}
