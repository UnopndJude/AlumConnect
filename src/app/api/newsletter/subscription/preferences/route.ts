import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/infrastructure/auth/middleware"
import { container } from "@/infrastructure/di/container"
import { SubscriptionPreferences } from "@/domain/subscription/entities/Subscription"

export async function GET() {
  try {
    // Require authentication
    const authResult = await requireAuth()
    if (!authResult.success) {
      return authResult.response
    }

    const { auth } = authResult
    const subscriptionRepository = container.getSubscriptionRepository()

    // Find subscription by userId first, then by email
    let subscription = await subscriptionRepository.findByUserId(auth.user.id)

    if (!subscription) {
      subscription = await subscriptionRepository.findByEmail(auth.user.email)
    }

    if (!subscription) {
      return NextResponse.json(
        { success: false, message: "구독 정보를 찾을 수 없습니다." },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      preferences: subscription.preferences,
    })
  } catch (error) {
    console.error("Get preferences error:", error)
    return NextResponse.json(
      { success: false, message: "설정 조회에 실패했습니다." },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    // Require authentication
    const authResult = await requireAuth()
    if (!authResult.success) {
      return authResult.response
    }

    const { auth } = authResult
    const preferences = await request.json()

    if (!preferences || typeof preferences !== "object") {
      return NextResponse.json(
        { success: false, message: "유효한 설정 정보가 필요합니다." },
        { status: 400 }
      )
    }

    // Validate preferences structure
    if (
      preferences.optOutFromScraping !== undefined &&
      typeof preferences.optOutFromScraping !== "boolean"
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "optOutFromScraping은 boolean 타입이어야 합니다.",
        },
        { status: 400 }
      )
    }

    if (preferences.contentPreferences !== undefined) {
      if (!Array.isArray(preferences.contentPreferences)) {
        return NextResponse.json(
          {
            success: false,
            message: "contentPreferences는 배열이어야 합니다.",
          },
          { status: 400 }
        )
      }
      if (
        !preferences.contentPreferences.every(
          (item: unknown) => typeof item === "string"
        )
      ) {
        return NextResponse.json(
          {
            success: false,
            message: "contentPreferences의 모든 항목은 문자열이어야 합니다.",
          },
          { status: 400 }
        )
      }
    }

    const subscriptionRepository = container.getSubscriptionRepository()

    // Find subscription by userId first, then by email
    let subscription = await subscriptionRepository.findByUserId(auth.user.id)

    if (!subscription) {
      subscription = await subscriptionRepository.findByEmail(auth.user.email)
    }

    if (!subscription) {
      return NextResponse.json(
        { success: false, message: "구독 정보를 찾을 수 없습니다." },
        { status: 404 }
      )
    }

    // Update preferences
    subscription.updatePreferences(
      preferences as Partial<SubscriptionPreferences>
    )
    await subscriptionRepository.save(subscription)

    return NextResponse.json({
      success: true,
      message: "설정이 업데이트되었습니다.",
      preferences: subscription.preferences,
    })
  } catch (error) {
    console.error("Update preferences error:", error)
    return NextResponse.json(
      { success: false, message: "설정 업데이트에 실패했습니다." },
      { status: 500 }
    )
  }
}
