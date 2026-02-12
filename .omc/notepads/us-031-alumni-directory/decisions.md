# Architectural Decisions for US-031: Alumni Directory

## 1. Pagination Implementation

**Decision**: Server-side pagination with URL-based page state

**Rationale**:
- Keeps URL in sync with displayed content (shareable, bookmarkable)
- Reduces data transfer for large alumni lists
- Allows browser back/forward navigation
- Standard pattern in Next.js applications

**Alternatives Considered**:
- Client-side pagination: Would require fetching all data upfront
- Infinite scroll: Less suitable for directory browsing

## 2. Tiered Access at API Level

**Decision**: Return different data shapes based on verification status in API

**Rationale**:
- Security: Prevents unauthorized access to contact info
- Single source of truth: API controls what data is visible
- Simpler frontend: No need to filter on client side
- Flexible: Easy to add more access tiers in future

**Alternatives Considered**:
- Field-level permissions in database: More complex, less flexible
- Frontend filtering: Insecure, data still sent to client

## 3. Search Implementation

**Decision**: Backend filtering with ilike for name search

**Rationale**:
- Case-insensitive search improves UX
- Partial matching allows finding users without exact spelling
- Database-level filtering is more efficient than client-side
- Supabase ilike operator is performant with proper indexing

**Alternatives Considered**:
- Full-text search: Overkill for simple name/class filtering
- Client-side filtering: Poor performance with many users

## 4. Repository Interface Extension

**Decision**: Add findAll method with filters and pagination to IProfileRepository

**Rationale**:
- Follows existing repository pattern in codebase
- Flexible filter object allows adding more filter criteria
- Pagination object is reusable across repositories
- PaginatedResult type provides consistent response shape

**Implementation Notes**:
- ProfileFilters uses optional fields for flexibility
- Pagination has sensible defaults (page 1, limit 20)
- PaginatedResult includes totalPages for easy UI rendering

## 5. Client Component Architecture

**Decision**: Separate components for search form, list, and connection button

**Rationale**:
- Single responsibility principle
- Easier to test and maintain
- Search form can be reused elsewhere
- Connection button logic is self-contained

**Component Breakdown**:
- DirectorySearch: Form with controlled inputs, URL updates
- DirectoryList: Data fetching and rendering
- ConnectionRequestButton: Stateful button with inline form

## 6. Connection Request Flow

**Decision**: Inline message input on button click, POST to /api/connections

**Rationale**:
- Reuses existing connection API endpoint
- No modal needed, simpler UX
- Optional message field encourages personalization
- Success state prevents duplicate requests

**Alternatives Considered**:
- Modal dialog: More complex, requires additional state management
- Separate page: Too many steps, friction in user flow

## 7. Excluding Current User

**Decision**: Always exclude current user from directory results

**Rationale**:
- Users don't need to see themselves in directory
- Prevents accidentally sending connection request to self
- Reduces clutter in results
- Backend enforcement ensures consistency

## 8. Test Strategy

**Decision**: Test repository and API layers, skip client component tests

**Rationale**:
- Repository tests verify data filtering and pagination logic
- API tests verify auth, authorization, and data transformation
- Client component tests are complex with Next.js App Router
- Manual testing sufficient for simple UI components

**Testing Focus**:
- Repository: All filter combinations, pagination edge cases
- API: Auth flows, tiered access, error handling
- Manual: UI interactions, form submission, pagination
