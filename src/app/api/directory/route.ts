import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/infrastructure/auth/middleware"
import { container } from "@/infrastructure/di/container"

export async function GET(request: NextRequest) {
  const authResult = await requireAuth()
  if (!authResult.success) {
    return authResult.response
  }

  if (!authResult.auth.profile) {
    return NextResponse.json(
      { success: false, message: "Profile not found." },
      { status: 404 }
    )
  }

  try {
    const { searchParams } = new URL(request.url)
    const name = searchParams.get("q")
    const graduationClass = searchParams.get("graduationClass")
    const page = parseInt(searchParams.get("page") || "1", 10)
    const limit = parseInt(searchParams.get("limit") || "20", 10)

    const profileRepository = container.getProfileRepository()

    // Build filters
    const filters: {
      name?: string
      graduationClass?: number
      excludeProfileId: string
    } = {
      excludeProfileId: authResult.auth.profile.id,
    }

    if (name) {
      filters.name = name
    }

    if (graduationClass) {
      const classNum = parseInt(graduationClass, 10)
      if (!isNaN(classNum)) {
        filters.graduationClass = classNum
      }
    }

    // Fetch profiles
    const result = await profileRepository.findAll(filters, { page, limit })

    // Determine what data to return based on verification status
    const isVerified = authResult.auth.profile.isVerified

    const profiles = result.items.map((profile) => {
      const primitives = profile.toPrimitives()

      if (isVerified) {
        // Verified users see full profiles
        return {
          id: primitives.id,
          name: primitives.name,
          graduationClass: primitives.graduationClass,
          email: primitives.email,
          isVerified: primitives.isVerified,
          alumniId: primitives.alumniId,
        }
      } else {
        // Non-verified users see limited data
        return {
          id: primitives.id,
          name: primitives.name,
          graduationClass: primitives.graduationClass,
          isVerified: primitives.isVerified,
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        profiles,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages,
        },
        isVerified,
      },
    })
  } catch (error) {
    console.error("Error fetching directory:", error)
    return NextResponse.json(
      { success: false, message: "Failed to fetch alumni directory." },
      { status: 500 }
    )
  }
}
