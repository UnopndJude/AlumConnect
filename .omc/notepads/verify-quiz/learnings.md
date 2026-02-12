# Learnings from Quiz Verification Implementation

## Architecture Insights

### Domain-Driven Design Benefits

- The existing `Profile.verify()` method made implementation straightforward
- Value objects and entities were already designed to support this feature
- No changes needed to core domain logic

### Clean Architecture Success

- Use case pattern allowed easy composition of existing services
- Separation of concerns made it simple to add new endpoints
- Repository pattern abstracted database operations cleanly

### Component Reusability

- `QuizForm` component was perfectly reusable for verification
- No UI changes needed - just wired it to new endpoints
- Consistent UX across registration and verification flows

## TypeScript Type Safety

### Null vs Undefined Handling

- Supabase returns `null` for missing foreign keys
- TypeScript DTOs expect `undefined` for optional fields
- Solution: `profile.alumni_id || undefined` conversion

### Escaped Characters in JSX

- React/ESLint requires escaping quotes in text content
- Use `&quot;` instead of `"` in JSX strings
- Prevents XSS vulnerabilities and parsing issues

## Next.js Patterns

### Route Groups

- `(auth)` group allows logical organization without affecting URLs
- `/verify` is at root level, not `/auth/verify`
- Shared layouts possible within groups

### API Route Parameters

- Unused `request` parameter triggers ESLint warning
- Remove if not used: `export async function POST()`
- Type safety still maintained

### Server-Side Data Fetching

- Client components can call server actions via API routes
- Authentication checked server-side for security
- Redirects handled client-side based on response status

## Quiz System Architecture

### Session Management

- `StartQuizSessionUseCase` handles both registration and verification
- Sessions keyed by email (one active session per user)
- Existing session reused if not expired

### Grading Logic

- `QuizGradingService` is stateless and reusable
- Quiz scoring logic centralized in domain service
- Pass/fail criteria configured globally

### Question Rotation

- New questions fetched on retry to prevent memorization
- Random selection from question pool
- Question state managed in session entity

## Error Handling

### Result Pattern

- Use cases return `Result<T, DomainError>` type
- Success/failure explicitly handled
- Error messages typed and structured

### HTTP Status Codes

- 401: Not authenticated
- 404: Profile not found
- 400: Already verified or validation error
- 500: Server error

### User-Friendly Messages

- Technical errors logged server-side
- Generic messages shown to users
- Korean language for all UI messages

## Testing Challenges

### Mocking Repositories

- Repository methods need proper mock implementations
- `findByIdString` method needs to be mocked
- Use case dependencies must be fully stubbed

### Async Operations

- All API routes are async
- Mock responses need `mockResolvedValue`
- Test async flows with `await`

## Security Considerations

### Authentication Flow

1. Check session exists
2. Verify session user owns profile
3. Validate profile state
4. Process request

### Profile Ownership

- Profile ID derived from session user ID
- Cannot verify someone else's profile
- No profile ID accepted from client

### Idempotency

- Already-verified profiles return early
- No side effects on repeated calls
- Safe to retry failed requests

## UX Patterns

### Skip Button Placement

- Placed at bottom, after quiz form
- Less prominent than submit button
- Border-top separator for visual hierarchy

### Loading States

- Full-screen loader on initial load
- Button loader on submission
- Prevents double-submission

### Success Flow

- Success message shown first
- Auto-redirect after 2 seconds
- Gives user time to read message

### Error Recovery

- Retry with new questions
- Clear remaining attempts indicator
- "나중에 하기" always available

## Code Style Consistency

### ESLint Rules

- No semicolons (enforced by config)
- 2-space indentation
- 80-character line width
- Prettier integration

### Naming Conventions

- Use cases: `VerbNounUseCase`
- DTOs: `ActionTypeDto`
- Components: `PascalCase`
- Variables: `camelCase`

### File Organization

- Domain layer: entities, value-objects, repositories, services
- Application layer: use-cases, dtos
- Infrastructure layer: persistence, di, external services
- Presentation layer: app, components

## Future Enhancements

### Possible Improvements

- Email notification on verification success
- Verification badge visible on profile
- Admin dashboard for verification stats
- Rate limiting on quiz attempts
- Question difficulty based on graduation class

### Technical Debt

- Test mocking could be improved
- More comprehensive error scenarios
- Integration tests for full flow
- E2E tests for user journey

## Performance Considerations

### Database Queries

- Single profile query per request
- Quiz questions loaded once per session
- Session state cached in database
- No N+1 query issues

### Build Optimization

- Static page generation for verify page
- Client-side hydration for interactivity
- Code splitting automatic via Next.js
- No unnecessary re-renders

## Deployment Notes

### Environment Variables

- Supabase credentials required
- Same config as rest of app
- No new environment variables

### Database Schema

- Uses existing `profiles` table
- `is_verified` boolean column already exists
- No migrations needed

### Backwards Compatibility

- Optional feature, no breaking changes
- Existing users unaffected
- Can be enabled gradually
