import { NextResponse } from "next/server"
import { requireAuth } from "@/infrastructure/auth/middleware"
import { container } from "@/infrastructure/di/container"

export async function POST() {
  try {
    // Require authentication
    const authResult = await requireAuth()
    if (!authResult.success) {
      return authResult.response
    }

    const { auth } = authResult
    const subscriptionRepository = container.getSubscriptionRepository()

    // Find subscription by email
    const subscription = await subscriptionRepository.findByEmail(
      auth.user.email
    )

    if (!subscription) {
      return NextResponse.json(
        { success: false, message: "구독 정보를 찾을 수 없습니다." },
        { status: 404 }
      )
    }

    // Check if already linked
    if (subscription.isLinked) {
      return NextResponse.json({
        success: true,
        message: "이미 계정과 연결되어 있습니다.",
        subscription: {
          id: subscription.id,
          email: subscription.email,
          userId: subscription.userId,
        },
      })
    }

    // Link subscription to user
    subscription.linkToUser(auth.user.id)
    await subscriptionRepository.save(subscription)

    return NextResponse.json({
      success: true,
      message: "구독이 계정과 연결되었습니다.",
      subscription: {
        id: subscription.id,
        email: subscription.email,
        userId: subscription.userId,
      },
    })
  } catch (error) {
    console.error("Subscription link error:", error)
    return NextResponse.json(
      { success: false, message: "구독 연결에 실패했습니다." },
      { status: 500 }
    )
  }
}
