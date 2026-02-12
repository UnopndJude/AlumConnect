# Learnings - US-001: Supabase Auth Helpers for SSR

## Implementation Summary

Successfully created Supabase Auth helper utilities for Next.js App Router with proper SSR support.

## Files Created

1. **`/src/infrastructure/supabase/auth.ts`**

   - `createBrowserClient()` - Browser client for client components
   - `createServerClient()` - Server client with cookie handling for server components/API routes
   - `getSession()` - Retrieves current session server-side
   - `getCurrentUser()` - Gets authenticated user with profile from users table

2. **`/src/app/auth/callback/route.ts`**
   - Handles Supabase Magic Link authentication callback
   - Exchanges code for session
   - Redirects to `/onboarding` if no profile exists
   - Redirects to `/` if profile exists

## Key Patterns

### SSR Cookie Handling

- Used `@supabase/ssr` package (not deprecated `@supabase/auth-helpers-nextjs`)
- Properly handles cookies in Next.js 15 App Router with async `cookies()` API
- Cookie setAll includes try-catch for Server Component context

### Code Style

- No semicolons (per project style guide)
- 2-space indentation
- Proper TypeScript types from Database

### Architecture

- Follows existing infrastructure pattern in `/src/infrastructure/supabase/`
- Exports new functions from index.ts for clean imports
- Separates browser and server client creation for proper context usage

## Verification

- Build passes: `pnpm build` ✓
- Lint passes: `pnpm lint` ✓
- Type checking successful with Next.js 15.2.0

## Dependencies Added

- `@supabase/ssr` v0.8.0

## Next Steps

- Test auth flow with actual Magic Link emails
- Create middleware for route protection if needed
- Add error handling/logging for auth operations
