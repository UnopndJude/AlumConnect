import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/infrastructure/auth/middleware"
import { container } from "@/infrastructure/di/container"
import { Newsletter } from "@/domain/newsletter/entities/Newsletter"

// POST /api/admin/newsletter - Create new newsletter draft
export async function POST(request: NextRequest) {
  const authResult = await requireAdmin()
  if (!authResult.success) return authResult.response

  try {
    const body = await request.json()
    const { title } = body

    if (!title || typeof title !== "string" || title.trim().length === 0) {
      return NextResponse.json(
        { success: false, message: "제목은 필수입니다." },
        { status: 400 }
      )
    }

    const newsletterRepository = container.getNewsletterRepository()

    // Get next edition number
    const edition = await newsletterRepository.getNextEditionNumber()

    // Create newsletter
    const newsletter = Newsletter.create({
      edition,
      title: title.trim(),
      sections: [],
    })

    // Save newsletter
    await newsletterRepository.save(newsletter)

    return NextResponse.json({
      success: true,
      data: newsletter.toPrimitives(),
    })
  } catch (error) {
    console.error("Failed to create newsletter:", error)
    return NextResponse.json(
      { success: false, message: "뉴스레터 생성에 실패했습니다." },
      { status: 500 }
    )
  }
}

// GET /api/admin/newsletter - List all newsletters (admin only)
export async function GET() {
  const authResult = await requireAdmin()
  if (!authResult.success) return authResult.response

  try {
    const newsletterRepository = container.getNewsletterRepository()

    // Get all newsletters (drafts and published)
    const newsletters = await newsletterRepository.findAll()

    return NextResponse.json({
      success: true,
      data: newsletters.map((n) => n.toPrimitives()),
    })
  } catch (error) {
    console.error("Failed to list newsletters:", error)
    return NextResponse.json(
      { success: false, message: "뉴스레터 목록 조회에 실패했습니다." },
      { status: 500 }
    )
  }
}
