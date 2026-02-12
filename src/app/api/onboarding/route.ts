import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/infrastructure/supabase"
import { container } from "@/infrastructure/di/container"
import { Profile } from "@/domain/profile/entities/Profile"
import { Email } from "@/domain/user/value-objects/Email"
import { GraduationClass } from "@/domain/user/value-objects/GraduationClass"
import { ProfileId } from "@/domain/profile/value-objects"

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const supabase = await createServerClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json(
        { success: false, message: "로그인이 필요합니다." },
        { status: 401 }
      )
    }

    // Check if profile already exists
    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", session.user.id)
      .single()

    if (existingProfile) {
      return NextResponse.json(
        { success: false, message: "이미 프로필이 존재합니다." },
        { status: 400 }
      )
    }

    const { name, graduationClass } = await request.json()

    // Validate
    if (!name || !graduationClass) {
      return NextResponse.json(
        { success: false, message: "이름과 기수를 입력해주세요." },
        { status: 400 }
      )
    }

    // Validate name
    if (typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { success: false, message: "올바른 이름을 입력해주세요." },
        { status: 400 }
      )
    }

    // Create value objects
    const emailResult = Email.create(session.user.email!)
    if (!emailResult.success) {
      return NextResponse.json(
        { success: false, message: emailResult.error.message },
        { status: 400 }
      )
    }

    const graduationClassResult = GraduationClass.create(graduationClass)
    if (!graduationClassResult.success) {
      return NextResponse.json(
        { success: false, message: graduationClassResult.error.message },
        { status: 400 }
      )
    }

    // Match against Alumni DB
    const alumniMatchingService = container.getAlumniMatchingService()
    const matchResult = await alumniMatchingService.match(
      name.trim(),
      graduationClassResult.value
    )

    if (!matchResult.matched) {
      return NextResponse.json(
        {
          success: false,
          message:
            matchResult.message ||
            "동문 데이터베이스에서 일치하는 정보를 찾을 수 없습니다. 관리자에게 문의하세요.",
        },
        { status: 404 }
      )
    }

    // Create profile
    const newProfile = Profile.create({
      id: ProfileId.create(session.user.id),
      email: emailResult.value,
      name: name.trim(),
      graduationClass: graduationClassResult.value,
      alumniId: matchResult.alumniId?.getValue() || null,
    })

    const profileRepository = container.getProfileRepository()
    await profileRepository.save(newProfile)

    return NextResponse.json({
      success: true,
      message: "프로필이 생성되었습니다.",
      profile: newProfile.toPrimitives(),
    })
  } catch (error) {
    console.error("Onboarding error:", error)
    return NextResponse.json(
      { success: false, message: "서버 오류가 발생했습니다." },
      { status: 500 }
    )
  }
}
