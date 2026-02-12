import { NextRequest, NextResponse } from "next/server"
import { container } from "@/infrastructure/di/container"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get("page") || "1", 10)
    const limit = parseInt(searchParams.get("limit") || "10", 10)

    // Validate pagination parameters
    if (page < 1 || limit < 1 || limit > 100) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid pagination parameters. Page must be >= 1, limit must be between 1-100.",
        },
        { status: 400 }
      )
    }

    const newsletterRepository = container.getNewsletterRepository()
    const allPublishedNewsletters =
      await newsletterRepository.findAllPublished()

    // Calculate pagination
    const totalCount = allPublishedNewsletters.length
    const totalPages = Math.ceil(totalCount / limit)
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit

    // Get paginated newsletters
    const paginatedNewsletters = allPublishedNewsletters.slice(
      startIndex,
      endIndex
    )

    // Transform to response format (without full content in sections)
    const newsletters = paginatedNewsletters.map((newsletter) => {
      const primitives = newsletter.toPrimitives()
      return {
        id: primitives.id,
        edition: primitives.edition,
        title: primitives.title,
        publishedAt: primitives.publishedAt,
        sections: primitives.sections.map((section) => ({
          id: section.id,
          type: section.type,
          title: section.title,
          order: section.order,
          // Omit content field for list view
        })),
      }
    })

    return NextResponse.json({
      success: true,
      data: newsletters,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    })
  } catch (error) {
    console.error("Error fetching newsletters:", error)
    return NextResponse.json(
      { success: false, message: "Failed to fetch newsletters." },
      { status: 500 }
    )
  }
}
