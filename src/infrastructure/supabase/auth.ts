import { createServerClient as createServerClientSSR } from "@supabase/ssr"
import { cookies } from "next/headers"
import type { Database } from "./types"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables")
}

// Re-export browser client from browser
export { createBrowserClient } from "./browser"

/**
 * Creates a Supabase client for use in server components and API routes
 * Properly handles cookies for session management
 */
export async function createServerClient() {
  const cookieStore = await cookies()

  return createServerClientSSR<Database>(supabaseUrl!, supabaseAnonKey!, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        } catch {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
    },
  })
}

/**
 * Gets the current session from the server
 * Returns null if no session exists
 */
export async function getSession() {
  const supabase = await createServerClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()
  return session
}

/**
 * Gets the current authenticated user with their profile
 * Returns null if not authenticated or profile not found
 */
export async function getCurrentUser() {
  const session = await getSession()
  if (!session) {
    return { user: null, profile: null }
  }

  const supabase = await createServerClient()

  // Get user profile from profiles table
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", session.user.id)
    .single()

  if (error || !profile) {
    return {
      user: {
        id: session.user.id,
        email: session.user.email!,
      },
      profile: null,
    }
  }

  return {
    user: {
      id: session.user.id,
      email: session.user.email!,
    },
    profile: {
      id: profile.id,
      email: profile.email,
      name: profile.name,
      graduationClass: profile.graduation_class,
      isVerified: profile.is_verified,
      isAdmin: profile.is_admin,
      alumniId: profile.alumni_id,
    },
  }
}
