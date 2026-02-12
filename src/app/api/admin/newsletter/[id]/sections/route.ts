import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/infrastructure/auth/middleware"
import { container } from "@/infrastructure/di/container"
import {
  NewsletterSection,
  SectionType,
} from "@/domain/newsletter/entities/NewsletterSection"

const VALID_SECTION_TYPES: SectionType[] = [
  "alumni_in_media",
  "member_announcements",
  "industry_trends",
]

// POST /api/admin/newsletter/[id]/sections - Add section to newsletter
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAdmin()
  if (!authResult.success) return authResult.response

  try {
    const { id } = await params
    const body = await request.json()
    const { type, title, content, order } = body

    // Validate inputs
    if (!type || !VALID_SECTION_TYPES.includes(type)) {
      return NextResponse.json(
        { success: false, message: "유효하지 않은 섹션 타입입니다." },
        { status: 400 }
      )
    }

    if (!title || typeof title !== "string" || title.trim().length === 0) {
      return NextResponse.json(
        { success: false, message: "섹션 제목은 필수입니다." },
        { status: 400 }
      )
    }

    if (
      !content ||
      typeof content !== "string" ||
      content.trim().length === 0
    ) {
      return NextResponse.json(
        { success: false, message: "섹션 내용은 필수입니다." },
        { status: 400 }
      )
    }

    if (typeof order !== "number" || order < 0) {
      return NextResponse.json(
        { success: false, message: "섹션 순서는 0 이상의 숫자여야 합니다." },
        { status: 400 }
      )
    }

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
        { success: false, message: "발행된 뉴스레터는 수정할 수 없습니다." },
        { status: 400 }
      )
    }

    // Create section
    const section = NewsletterSection.create({
      type: type as SectionType,
      title: title.trim(),
      content: content.trim(),
      order,
    })

    // Add section to newsletter
    newsletter.addSection(section)
    await newsletterRepository.save(newsletter)

    return NextResponse.json({
      success: true,
      data: section.toPrimitives(),
    })
  } catch (error) {
    console.error("Failed to add section:", error)

    if (
      error instanceof Error &&
      error.message === "Cannot edit published newsletter"
    ) {
      return NextResponse.json(
        { success: false, message: "발행된 뉴스레터는 수정할 수 없습니다." },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, message: "섹션 추가에 실패했습니다." },
      { status: 500 }
    )
  }
}

// GET /api/admin/newsletter/[id]/sections - Get all sections
export async function GET(
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

    return NextResponse.json({
      success: true,
      data: newsletter.sections.map((s) => s.toPrimitives()),
    })
  } catch (error) {
    console.error("Failed to get sections:", error)
    return NextResponse.json(
      { success: false, message: "섹션 조회에 실패했습니다." },
      { status: 500 }
    )
  }
}
