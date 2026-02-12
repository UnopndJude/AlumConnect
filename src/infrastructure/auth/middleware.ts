import { NextResponse } from "next/server"
import { getCurrentUser } from "@/infrastructure/supabase/auth"

export type AuthResult = {
  user: { id: string; email: string }
  profile: {
    id: string
    email: string
    name: string
    graduationClass: number
    isVerified: boolean
    isAdmin: boolean
    alumniId: string | null
  } | null
}

// Get current user, returns null if not authenticated
export async function getAuthUser(): Promise<AuthResult | null> {
  const result = await getCurrentUser()
  if (!result.user) return null
  return {
    user: { id: result.user.id, email: result.user.email! },
    profile: result.profile,
  }
}

// Require authentication - returns error response if not authenticated
export async function requireAuth(): Promise<
  | { success: true; auth: AuthResult }
  | { success: false; response: NextResponse }
> {
  const auth = await getAuthUser()
  if (!auth) {
    return {
      success: false,
      response: NextResponse.json(
        { success: false, message: "로그인이 필요합니다." },
        { status: 401 }
      ),
    }
  }
  return { success: true, auth }
}

// Require authentication + profile
export async function requireProfile(): Promise<
  | {
      success: true
      auth: AuthResult & { profile: NonNullable<AuthResult["profile"]> }
    }
  | { success: false; response: NextResponse }
> {
  const authResult = await requireAuth()
  if (!authResult.success) return authResult

  if (!authResult.auth.profile) {
    return {
      success: false,
      response: NextResponse.json(
        { success: false, message: "프로필 설정이 필요합니다." },
        { status: 403 }
      ),
    }
  }
  return {
    success: true,
    auth: authResult.auth as AuthResult & {
      profile: NonNullable<AuthResult["profile"]>
    },
  }
}

// Require verified status
export async function requireVerified(): Promise<
  | {
      success: true
      auth: AuthResult & { profile: NonNullable<AuthResult["profile"]> }
    }
  | { success: false; response: NextResponse }
> {
  const profileResult = await requireProfile()
  if (!profileResult.success) return profileResult

  if (!profileResult.auth.profile.isVerified) {
    return {
      success: false,
      response: NextResponse.json(
        { success: false, message: "인증된 동문만 이용 가능합니다." },
        { status: 403 }
      ),
    }
  }
  return profileResult
}

// Require admin status
export async function requireAdmin(): Promise<
  | {
      success: true
      auth: AuthResult & { profile: NonNullable<AuthResult["profile"]> }
    }
  | { success: false; response: NextResponse }
> {
  const profileResult = await requireProfile()
  if (!profileResult.success) return profileResult

  if (!profileResult.auth.profile.isAdmin) {
    return {
      success: false,
      response: NextResponse.json(
        { success: false, message: "관리자 권한이 필요합니다." },
        { status: 403 }
      ),
    }
  }
  return profileResult
}
