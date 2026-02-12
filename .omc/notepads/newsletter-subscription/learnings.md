# Learnings - Newsletter Subscription (US-011, US-012)

## Implementation Date

2026-02-12

## What Was Implemented

### US-011: Public Newsletter Subscription API

- Created `/src/app/api/newsletter/subscribe/route.ts` with POST endpoint
- Accepts `{ email: string }` and validates format
- Checks for existing subscriptions and handles resubscription
- Uses container pattern to get SubscriptionRepository

### US-012: Token-based Unsubscribe

- Enhanced Subscription entity with `unsubscribeToken` field
- Added `generateUnsubscribeToken()` static method using crypto.randomUUID()
- Created `/src/app/api/newsletter/unsubscribe/route.ts` with GET endpoint
- Token is generated on subscription creation and stored in database

## Architecture Patterns

### Clean Architecture with DDD

- Domain Entity: `Subscription` contains all business logic
- Repository Pattern: `ISubscriptionRepository` interface with Supabase and InMemory implementations
- Dependency Injection: Container pattern provides repositories
- API Routes: Thin controllers that delegate to repositories

### Repository Methods Added

- `findByUnsubscribeToken(token: string): Promise<Subscription | null>`
  - Added to interface and both implementations

### Entity Methods

- `static generateUnsubscribeToken(): string` - Generates new UUID token
- Token automatically generated in `create()` method
- Token stored as readonly property via getter

## Database Schema

- Added `unsubscribe_token TEXT NOT NULL UNIQUE DEFAULT uuid_generate_v4()`
- Added index on `unsubscribe_token` for fast lookup
- Migration: `supabase/migrations/004_subscriptions.sql`

## Type Definitions

- Updated `src/infrastructure/supabase/types.ts`
- Added `unsubscribe_token: string` to Row, Insert, and Update types
- Important: Type definitions must match database schema for compile-time safety

## Testing Strategy

### Entity Tests

- Test token generation (uniqueness, format)
- Test unsubscribe/resubscribe flow
- Test fromPrimitives/toPrimitives with token

### API Tests

- Mock container and repository
- Test success cases (new subscription, existing active, resubscription)
- Test validation (missing email, invalid format)
- Test error handling

### Test Coverage

- 12 tests for Subscription entity
- 7 tests for subscribe endpoint
- 5 tests for unsubscribe endpoint
- All tests passing (98 total across project)

## Code Conventions

### Import Casing

- CRITICAL: Use lowercase `container` when importing DI container
- File is `Container.ts` but import as `@/infrastructure/di/container`
- TypeScript/Next.js case sensitivity issue on build

### Code Style

- No semicolons
- 2-space indentation
- Email normalization: Always `.toLowerCase()` before storing
- Error messages: Clear, user-friendly messages

## API Design

### Subscribe Endpoint

```typescript
POST /api/newsletter/subscribe
Body: { email: string }
Responses:
  200: { message: "Successfully subscribed..." }
  400: { error: "Email is required" | "Invalid email format" }
  500: { error: "Failed to subscribe..." }
```

### Unsubscribe Endpoint

```typescript
GET /api/newsletter/unsubscribe?token=xxx
Responses:
  200: { message: "Successfully unsubscribed..." }
  400: { error: "Unsubscribe token is required" }
  404: { error: "Invalid or expired unsubscribe link" }
  500: { error: "Failed to unsubscribe..." }
```

## Security Considerations

### Token-based Unsubscribe

- UUID v4 tokens are cryptographically secure
- Tokens are unique per subscription
- No authentication required (by design for email links)
- Token in URL is acceptable for unsubscribe (low security risk)

### Email Validation

- Regex validation on input
- Case-insensitive storage and lookup
- Single subscription per email enforced by UNIQUE constraint

## Future Improvements

- Consider token expiration (currently permanent)
- Add rate limiting to prevent abuse
- Consider separate tokens for different actions (update preferences vs unsubscribe)
- Add analytics on subscription/unsubscription events

# Learnings: Newsletter Subscription API Implementation

## Implementation Date

2026-02-12

## User Stories Implemented

- US-013: Link Subscription to Account
- US-014: Manage Subscription Preferences

## Patterns Observed

### Authentication Middleware

- Used `requireAuth()` from `@/infrastructure/auth/middleware` for all endpoints
- Returns standardized error response when authentication fails
- Provides user ID and email for authenticated users
- No need to manually check auth status - middleware handles it

### Subscription Lookup Pattern

- Always check by userId first, then fallback to email
- This handles both linked and unlinked subscriptions
- Pattern used in all GET/PATCH endpoints:
  ```typescript
  let subscription = await subscriptionRepository.findByUserId(auth.user.id)
  if (!subscription) {
    subscription = await subscriptionRepository.findByEmail(auth.user.email)
  }
  ```

### API Response Structure

- All responses include `success` boolean
- Success responses include relevant data
- Error responses include `message` in Korean
- HTTP status codes properly set (200, 400, 401, 404, 500)

### Domain Entity Methods

- `subscription.linkToUser(userId)` - Links subscription to user account
- `subscription.updatePreferences(preferences)` - Partial update of preferences
- `subscription.isLinked` - Boolean getter to check if linked to user
- Methods maintain immutability of domain entities

## API Endpoints Created

### POST /api/newsletter/subscription/link

- Links email-based subscription to authenticated user account
- Returns success if already linked (idempotent)
- Returns 404 if no subscription exists for user's email

### GET /api/newsletter/subscription

- Returns full subscription details for authenticated user
- Includes id, email, userId, status, preferences, dates

### PATCH /api/newsletter/subscription

- Updates subscription preferences
- Validates preferences structure before updating
- Supports partial updates

### GET /api/newsletter/subscription/preferences

- Returns only preferences object (cleaner API)

### PATCH /api/newsletter/subscription/preferences

- Updates only preferences (accepts preferences directly in body)
- Cleaner alternative to the full subscription PATCH

## Validation Patterns

### Preferences Validation

- `optOutFromScraping` must be boolean if provided
- `contentPreferences` must be array of strings if provided
- Both are optional (partial updates supported)
- Validation code reusable across endpoints

## Testing Patterns

### Mocking Strategy

- Mock `requireAuth` to control authentication state
- Mock `container.getSubscriptionRepository()` for repository methods
- Use `vi.mocked()` for type-safe mocks

### Test Coverage

- Authentication required tests (401)
- Not found tests (404)
- Validation error tests (400)
- Server error tests (500)
- Success cases (200)
- Edge cases (already linked, partial updates)

### Test Structure

- BeforeEach: Clear all mocks and setup default repository mock
- Describe blocks for GET/PATCH endpoints
- Individual tests for each scenario
- Use `createMockRequest()` helper for PATCH tests

## Code Style

- No semicolons (project convention)
- 2-space indentation
- Korean error messages for user-facing responses
- English for console.error logging

## DI Container Usage

- `container.getSubscriptionRepository()` - Get subscription repository
- All repository access goes through container
- Enables easy mocking in tests
