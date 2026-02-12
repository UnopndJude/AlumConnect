# Learnings from US-031: Alumni Directory Implementation

## Architecture Patterns

### Repository Pattern Extension
- Extended IProfileRepository interface with findAll method
- Added ProfileFilters and Pagination types for flexible querying
- Returned PaginatedResult with items, total, page, limit, totalPages
- This pattern allows for consistent pagination across different data sources

### Clean Architecture Layers
- **Domain Layer**: Added repository interface with filter/pagination types
- **Infrastructure Layer**: Implemented findAll in both InMemory and Supabase repositories
- **Application Layer**: API route handles auth and data transformation
- **Presentation Layer**: Server component + client components for search/display

## Implementation Details

### Tiered Access Pattern
- Non-verified users see limited profile data (name, graduationClass only)
- Verified users see full profile data (email, alumniId, etc.)
- API returns different data based on user verification status
- Frontend displays appropriate actions based on verification

### Supabase Query Optimization
- Used `ilike` for case-insensitive name search
- Applied `range()` for pagination (start, end indices)
- Used `count: "exact"` to get total count for pagination
- Ordered by `created_at` descending for consistency

### InMemory Repository Testing
- InMemoryProfileRepository uses a singleton Map that persists across tests
- Solution: Use unique emails for each test run to avoid collisions
- Better approach: Add clear() method or use dependency injection for tests
- Tests verify filtering, pagination, and exclusion logic

## Client Components

### Search Form Pattern
- useSearchParams to read URL params
- useTransition for pending state during navigation
- Update URL params on form submit
- Reset page to 1 on new search

### List Component Pattern
- Fetch data in useEffect based on URL params
- Display loading and empty states
- Map over results to render cards
- Pagination controls using Link components

### Connection Request Button
- Inline form with message input
- Show/hide pattern for optional message
- Success state with auto-refresh
- Error handling with user feedback

## Security & Auth

### Middleware Usage
- requireAuth ensures user is logged in
- Returns appropriate error responses
- Profile check ensures user has completed onboarding
- Exclude current user from directory results

### Data Privacy
- Different data returned based on verification status
- Email and contact info only visible to verified users
- Current user always excluded from results

## Testing Strategies

### Repository Tests
- Test filtering by name (exact and partial match)
- Test filtering by graduation class
- Test exclusion by profile ID
- Test pagination (different pages, limits)
- Test edge cases (no matches, beyond available results)

### API Route Tests
- Mock auth middleware for different scenarios
- Mock repository for controlled test data
- Test unauthorized access (401)
- Test missing profile (404)
- Test tiered access (verified vs non-verified)
- Test filter and pagination parameters
- Test error handling (500)

## Code Style Compliance
- No semicolons
- 2-space indentation
- All new files pass ESLint checks
- TypeScript strict mode
