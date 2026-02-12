import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/infrastructure/auth/middleware"
import { container } from "@/infrastructure/di/container"

// PATCH /api/admin/newsletter/[id]/sections/[sectionId] - Update section
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; sectionId: string }> }
) {
  const authResult = await requireAdmin()
  if (!authResult.success) return authResult.response

  try {
    const { id, sectionId } = await params
    const body = await request.json()
    const { title, content } = body

    // At least one field must be provided
    if (!title && !content) {
      return NextResponse.json(
        { success: false, message: "수정할 내용이 없습니다." },
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

    // Find section
    const section = newsletter.sections.find((s) => s.id === sectionId)

    if (!section) {
      return NextResponse.json(
        { success: false, message: "섹션을 찾을 수 없습니다." },
        { status: 404 }
      )
    }

    // Update section
    const newTitle = title?.trim() || section.title
    const newContent = content?.trim() || section.content

    if (newTitle.length === 0) {
      return NextResponse.json(
        { success: false, message: "섹션 제목은 필수입니다." },
        { status: 400 }
      )
    }

    if (newContent.length === 0) {
      return NextResponse.json(
        { success: false, message: "섹션 내용은 필수입니다." },
        { status: 400 }
      )
    }

    section.updateContent(newTitle, newContent)
    await newsletterRepository.save(newsletter)

    return NextResponse.json({
      success: true,
      data: section.toPrimitives(),
    })
  } catch (error) {
    console.error("Failed to update section:", error)
    return NextResponse.json(
      { success: false, message: "섹션 수정에 실패했습니다." },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/newsletter/[id]/sections/[sectionId] - Remove section
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; sectionId: string }> }
) {
  const authResult = await requireAdmin()
  if (!authResult.success) return authResult.response

  try {
    const { id, sectionId } = await params
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

    // Check if section exists
    const sectionExists = newsletter.sections.some((s) => s.id === sectionId)

    if (!sectionExists) {
      return NextResponse.json(
        { success: false, message: "섹션을 찾을 수 없습니다." },
        { status: 404 }
      )
    }

    newsletter.removeSection(sectionId)
    await newsletterRepository.save(newsletter)

    return NextResponse.json({
      success: true,
      message: "섹션이 삭제되었습니다.",
    })
  } catch (error) {
    console.error("Failed to delete section:", error)

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
      { success: false, message: "섹션 삭제에 실패했습니다." },
      { status: 500 }
    )
  }
}
