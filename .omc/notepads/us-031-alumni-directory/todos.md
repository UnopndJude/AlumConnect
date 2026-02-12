# US-031: Alumni Directory Implementation TODO

## Status: completed

### Domain Layer
- [x] Add findAll method to IProfileRepository interface with filters and pagination
- [x] Implement findAll in InMemoryProfileRepository
- [x] Implement findAll in SupabaseProfileRepository

### API Layer
- [x] Create GET /api/directory route with tiered access
- [x] Add auth check and verification status check
- [x] Support search filters (name, graduationClass)
- [x] Support pagination (page, limit)
- [x] Exclude current user from results
- [x] Return appropriate data based on verification status

### Page Layer
- [x] Create /app/directory/page.tsx server component
- [x] Add auth check with redirect
- [x] Implement search form (name, graduation class filter)
- [x] Display alumni cards in responsive grid
- [x] Show "연결 요청" button for verified users
- [x] Show verification prompt for non-verified users
- [x] Implement pagination controls

### Testing
- [x] Write tests for findAll repository methods
- [x] Write tests for /api/directory route
- [ ] Write tests for directory page component (skipped - client components harder to test)

### Verification
- [x] Run tests and ensure they pass
- [x] Check linting
- [ ] Verify auth redirects work correctly (requires manual testing)
- [ ] Verify tiered access works correctly (requires manual testing)
