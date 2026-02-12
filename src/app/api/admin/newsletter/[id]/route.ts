import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/infrastructure/auth/middleware"
import { container } from "@/infrastructure/di/container"

// GET /api/admin/newsletter/[id] - Get newsletter by ID
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
      data: newsletter.toPrimitives(),
    })
  } catch (error) {
    console.error("Failed to get newsletter:", error)
    return NextResponse.json(
      { success: false, message: "뉴스레터 조회에 실패했습니다." },
      { status: 500 }
    )
  }
}

// PATCH /api/admin/newsletter/[id] - Update newsletter
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAdmin()
  if (!authResult.success) return authResult.response

  try {
    const { id } = await params
    const body = await request.json()
    const { title } = body

    if (!title || typeof title !== "string" || title.trim().length === 0) {
      return NextResponse.json(
        { success: false, message: "제목은 필수입니다." },
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

    newsletter.updateTitle(title.trim())
    await newsletterRepository.save(newsletter)

    return NextResponse.json({
      success: true,
      data: newsletter.toPrimitives(),
    })
  } catch (error) {
    console.error("Failed to update newsletter:", error)

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
      { success: false, message: "뉴스레터 수정에 실패했습니다." },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/newsletter/[id] - Delete newsletter
export async function DELETE(
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
        { success: false, message: "발행된 뉴스레터는 삭제할 수 없습니다." },
        { status: 400 }
      )
    }

    await newsletterRepository.delete(id)

    return NextResponse.json({
      success: true,
      message: "뉴스레터가 삭제되었습니다.",
    })
  } catch (error) {
    console.error("Failed to delete newsletter:", error)
    return NextResponse.json(
      { success: false, message: "뉴스레터 삭제에 실패했습니다." },
      { status: 500 }
    )
  }
}
