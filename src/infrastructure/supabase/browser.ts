import { createBrowserClient as createBrowserClientSSR } from "@supabase/ssr"
import type { Database } from "./types"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables")
}

/**
 * Creates a Supabase client for use in client components (browser)
 * Uses @supabase/ssr for proper cookie handling
 */
export function createBrowserClient() {
  return createBrowserClientSSR<Database>(supabaseUrl!, supabaseAnonKey!)
}
