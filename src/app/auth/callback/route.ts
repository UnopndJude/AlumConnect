import { createServerClient } from "@/infrastructure/supabase/auth"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

/**
 * Auth callback route for Supabase Magic Link authentication
 * Handles the redirect from Supabase after email verification
 */
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")

  if (code) {
    const supabase = await createServerClient()

    // Exchange the code for a session
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      // Redirect to error page or login with error message
      return NextResponse.redirect(
        new URL(`/auth/login?error=${error.message}`, requestUrl.origin)
      )
    }

    // Get the authenticated user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.redirect(
        new URL("/auth/login?error=User not found", requestUrl.origin)
      )
    }

    // Check if user has a profile in the users table
    const { data: profile } = await supabase
      .from("users")
      .select("*")
      .eq("id", user.id)
      .single()

    // If no profile exists, redirect to onboarding
    if (!profile) {
      return NextResponse.redirect(new URL("/onboarding", requestUrl.origin))
    }

    // If profile exists, redirect to home
    return NextResponse.redirect(new URL("/", requestUrl.origin))
  }

  // No code present, redirect to login
  return NextResponse.redirect(
    new URL("/auth/login?error=No authentication code", requestUrl.origin)
  )
}
