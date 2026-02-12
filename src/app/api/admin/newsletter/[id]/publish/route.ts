import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/infrastructure/auth/middleware"
import { container } from "@/infrastructure/di/container"

// POST /api/admin/newsletter/[id]/publish - Publish newsletter
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAdmin()
  if (!authResult.success) return authResult.response

  try {
    const { id } = await params
    const newsletterRepository = container.getNewsletterRepository()

    const newsletter = await newsletterRepository.findById(id)

    if (!newsletter) {
      return NextResponse.json(
        { success: false, message: "뉴스레터를 찾을 수 없습니다." },
        { status: 404 }
      )
    }

    if (newsletter.isPublished) {
      return NextResponse.json(
        { success: false, message: "이미 발행된 뉴스레터입니다." },
        { status: 400 }
      )
    }

    if (newsletter.sections.length === 0) {
      return NextResponse.json(
        { success: false, message: "최소 하나의 섹션이 필요합니다." },
        { status: 400 }
      )
    }

    newsletter.publish()
    await newsletterRepository.save(newsletter)

    return NextResponse.json({
      success: true,
      data: newsletter.toPrimitives(),
    })
  } catch (error) {
    console.error("Failed to publish newsletter:", error)

    if (error instanceof Error) {
      if (error.message === "Newsletter is already published") {
        return NextResponse.json(
          { success: false, message: "이미 발행된 뉴스레터입니다." },
          { status: 400 }
        )
      }
      if (error.message === "Newsletter must have at least one section") {
        return NextResponse.json(
          { success: false, message: "최소 하나의 섹션이 필요합니다." },
          { status: 400 }
        )
      }
    }

    return NextResponse.json(
      { success: false, message: "뉴스레터 발행에 실패했습니다." },
      { status: 500 }
    )
  }
}
