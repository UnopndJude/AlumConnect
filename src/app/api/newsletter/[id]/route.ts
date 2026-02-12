import { NextRequest, NextResponse } from "next/server"
import { container } from "@/infrastructure/di/container"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Newsletter ID is required." },
        { status: 400 }
      )
    }

    const newsletterRepository = container.getNewsletterRepository()
    const newsletter = await newsletterRepository.findById(id)

    if (!newsletter) {
      return NextResponse.json(
        { success: false, message: "Newsletter not found." },
        { status: 404 }
      )
    }

    // Only return published newsletters for public API
    if (!newsletter.isPublished) {
      return NextResponse.json(
        { success: false, message: "Newsletter not found." },
        { status: 404 }
      )
    }

    // Return full newsletter with all sections and content
    const primitives = newsletter.toPrimitives()

    return NextResponse.json({
      success: true,
      data: {
        id: primitives.id,
        edition: primitives.edition,
        title: primitives.title,
        status: primitives.status,
        publishedAt: primitives.publishedAt,
        createdAt: primitives.createdAt,
        sections: primitives.sections,
      },
    })
  } catch (error) {
    console.error("Error fetching newsletter:", error)
    return NextResponse.json(
      { success: false, message: "Failed to fetch newsletter." },
      { status: 500 }
    )
  }
}
