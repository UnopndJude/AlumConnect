import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/infrastructure/auth/middleware"
import { container } from "@/infrastructure/di/container"
import {
  generateNewsletterHtml,
  generateNewsletterText,
} from "@/infrastructure/email/templates/newsletter"
import { EmailMessage } from "@/domain/email/services/IEmailService"

// POST /api/admin/newsletter/[id]/distribute - Distribute newsletter to all subscribers
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAdmin()
  if (!authResult.success) return authResult.response

  try {
    const { id } = await params
    const newsletterRepository = container.getNewsletterRepository()
    const subscriptionRepository = container.getSubscriptionRepository()
    const emailService = container.getEmailService()

    // Validate newsletter exists and is published
    const newsletter = await newsletterRepository.findById(id)

    if (!newsletter) {
      return NextResponse.json(
        { success: false, message: "뉴스레터를 찾을 수 없습니다." },
        { status: 404 }
      )
    }

    if (!newsletter.isPublished) {
      return NextResponse.json(
        {
          success: false,
          message: "발행된 뉴스레터만 배포할 수 있습니다.",
        },
        { status: 400 }
      )
    }

    // Get all active subscribers
    const subscribers = await subscriptionRepository.findAllActive()

    if (subscribers.length === 0) {
      return NextResponse.json({
        success: true,
        sent: 0,
        failed: 0,
        message: "활성 구독자가 없습니다.",
      })
    }

    // Get base URL for unsubscribe links
    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

    // Generate email for each subscriber
    const messages: EmailMessage[] = subscribers.map((subscriber) => {
      const html = generateNewsletterHtml(newsletter, {
        unsubscribeToken: subscriber.unsubscribeToken,
        baseUrl,
      })

      const text = generateNewsletterText(newsletter).replace(
        "{unsubscribeUrl}",
        `${baseUrl}/api/newsletter/unsubscribe?token=${subscriber.unsubscribeToken}`
      )

      return {
        to: { email: subscriber.email },
        subject: `AlumConnect Newsletter - 제 ${newsletter.edition}호: ${newsletter.title}`,
        html,
        text,
      }
    })

    // Send emails using batch method
    const result = await emailService.sendBatch(messages)

    return NextResponse.json({
      success: result.success,
      sent: result.sent,
      failed: result.failed,
    })
  } catch (error) {
    console.error("Failed to distribute newsletter:", error)

    return NextResponse.json(
      {
        success: false,
        message: "뉴스레터 배포에 실패했습니다.",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
