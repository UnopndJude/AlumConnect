# Architectural Decisions for Quiz Verification

## Decision 1: Separate Use Case vs Reusing Existing

**Decision:** Create a new `VerifyProfileUseCase` instead of modifying `SubmitQuizAnswersUseCase`

**Rationale:**

- Clear separation of concerns (registration vs verification)
- Different authorization models (anonymous vs authenticated)
- Additional verification logic only needed for verification flow
- Easier to test and maintain independently
- Future changes to one don't affect the other

**Alternatives Considered:**

- Extend `SubmitQuizAnswersUseCase` with optional profile ID
  - Rejected: Would mix registration and verification concerns
  - Would require conditional logic based on context
- Create a wrapper use case
  - Rejected: Adds unnecessary abstraction layer

## Decision 2: API Route Structure

**Decision:** Two separate endpoints - `/api/verify` (init) and `/api/verify/quiz` (submit)

**Rationale:**

- Mirrors registration flow pattern (`/register/quiz` and `/register/quiz/submit`)
- Separation of session creation and answer submission
- Allows for future expansion (e.g., GET endpoint for session status)
- RESTful resource naming

**Alternatives Considered:**

- Single endpoint with different methods (GET/POST)
  - Rejected: Less explicit about intent
- Include in existing `/api/auth` routes
  - Rejected: Verification is post-authentication, different concern

## Decision 3: Skip Functionality Location

**Decision:** Place "나중에 하기" button at the bottom, separate from quiz form

**Rationale:**

- De-emphasizes skipping in favor of completion
- Visual hierarchy guides users toward verification
- Separated by border to indicate it's an alternative path
- Consistent with UX patterns where primary action is prominent

**Alternatives Considered:**

- Top-right as secondary button
  - Rejected: Too prominent, might reduce completion rate
- In the quiz form component
  - Rejected: Would require modifying reusable component

## Decision 4: Redirect Destinations

**Decision:**

- Not authenticated → `/login`
- No profile → `/onboarding`
- Already verified → `/?message=already_verified`
- Quiz passed → `/?message=verified`
- Skip clicked → `/`

**Rationale:**

- Natural flow through authentication → onboarding → verification
- Home page is central hub after completion
- Query parameters allow home page to show relevant messages
- No dead ends in user journey

**Alternatives Considered:**

- Redirect to dedicated success page
  - Rejected: Adds extra step, users want to see content
- Stay on verify page with success message
  - Rejected: Users expect progression after success

## Decision 5: Profile Verification Method

**Decision:** Use existing `Profile.verify()` domain method

**Rationale:**

- Domain logic already encapsulated in entity
- Consistent with DDD principles
- Single source of truth for verification logic
- Easy to add future validation or side effects

**Alternatives Considered:**

- Direct repository call to update field
  - Rejected: Bypasses domain logic, violates encapsulation
- Service method for verification
  - Rejected: Verification is inherent to profile entity

## Decision 6: Already-Verified Prevention

**Decision:** Check `is_verified` flag in API, return early with 400 status

**Rationale:**

- Prevents unnecessary quiz session creation
- Clear feedback to user
- Idempotent operation (safe to call multiple times)
- Reduces server load

**Alternatives Considered:**

- Allow re-verification (overwrite)
  - Rejected: No use case for re-verification
- Hide verify page from verified users
  - Rejected: Client-side check not secure, server should be source of truth

## Decision 7: Session Reuse Strategy

**Decision:** Reuse existing `StartQuizSessionUseCase` with profile data

**Rationale:**

- DRY principle - don't duplicate session creation logic
- Consistent session management across registration and verification
- Alumni matching data already in profile
- Same quiz question selection logic

**Alternatives Considered:**

- Create separate `StartVerificationSessionUseCase`
  - Rejected: 95% duplicate code, hard to maintain
- Pass profile entity to existing use case
  - Rejected: Would require changing DTO structure

## Decision 8: Error Handling on Max Attempts

**Decision:** Show error message with suggestion to contact admin, keep skip button available

**Rationale:**

- Doesn't force user into dead end
- Provides path forward (admin contact)
- Skip allows user to continue using app
- Future: could add "request manual review" feature

**Alternatives Considered:**

- Automatically redirect to home
  - Rejected: User doesn't see why they failed
- Disable skip button
  - Rejected: Too restrictive, punishes legitimate users

## Decision 9: Badge Preview Display

**Decision:** Show blue info box with badge description before quiz

**Rationale:**

- Motivates users to complete verification
- Clear benefit communication
- Consistent with onboarding pattern (match message box)
- Non-intrusive visual design

**Alternatives Considered:**

- Show badge image/icon
  - Rejected: Badge design not yet finalized
- No preview
  - Rejected: Users might not understand benefit

## Decision 10: Test Strategy

**Decision:** Focus on API route tests, mock repository methods

**Rationale:**

- API routes are integration points
- Repository mocking allows isolated testing
- Use case logic tested separately if needed
- Build verification catches TypeScript errors

**Alternatives Considered:**

- E2E tests with real database
  - Rejected: Slower, harder to maintain, out of scope
- Unit tests for every layer
  - Rejected: Diminishing returns, most logic is simple CRUD

## Decision 11: Component Reuse

**Decision:** Reuse `QuizForm` component without modification

**Rationale:**

- Component already designed for reusability
- Props interface supports both use cases
- Consistent UX across registration and verification
- No UI differences needed

**Alternatives Considered:**

- Create `VerificationQuizForm` component
  - Rejected: Would duplicate code unnecessarily
- Add verification-specific props
  - Rejected: Component doesn't need to know context

## Decision 12: Loading State Management

**Decision:** Full-screen loader on initial load, in-button loader on submission

**Rationale:**

- Full-screen: Page unusable until quiz loads
- In-button: Form visible, only submit disabled
- Prevents double-submission
- Clear feedback on async operations

**Alternatives Considered:**

- Skeleton UI on initial load
  - Rejected: Over-engineered for this use case
- Disable entire form on submission
  - Rejected: In-button loader is sufficient

## Trade-offs and Limitations

### Accepted Trade-offs

1. **No email notification** - Could be added later
2. **No verification analytics** - Could be added to admin panel
3. **Test mocking complexity** - Accepted for faster test execution
4. **No question difficulty selection** - Uses same pool as registration

### Known Limitations

1. **One session per email** - By design, but could cause issues if multiple tabs open
2. **No progress persistence** - Refresh loses answers (acceptable for quiz)
3. **No time limit display** - Session expires after 30 minutes but no countdown shown
4. **Hard-coded messages** - Not internationalized (Korean only)

## Future Considerations

### Potential Changes

1. Add verification badge display to profile
2. Email notification on verification success
3. Admin dashboard for verification metrics
4. Rate limiting on quiz attempts
5. Question pool filtering by graduation class

### Extensibility Points

1. Use case can be extended for different verification types
2. API routes can support additional query parameters
3. Component props allow for future customization
4. Repository interface supports additional profile operations

## Alignment with Requirements

All requirements from US-004 satisfied:

- ✅ Optional verification after onboarding
- ✅ Updates `is_verified = true` on pass
- ✅ Reuses existing quiz components
- ✅ "나중에 하기" skip button
- ✅ Pass/fail feedback with retry
- ✅ Clean UI matching onboarding
- ✅ Korean messages throughout
- ✅ Build verification passes
