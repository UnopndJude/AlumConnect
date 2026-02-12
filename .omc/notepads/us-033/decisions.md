# US-033 Architectural Decisions

## Landing Page UX Split

**Decision**: Create two distinct experiences for public vs authenticated users

**Rationale**:
- Public users need clear CTA and value proposition → Newsletter focus
- Authenticated users need quick access to features → Dashboard view
- Reduces cognitive load by showing relevant content only

## Newsletter Subscription Form Design

**Decision**: Single, reusable client component with inline validation

**Rationale**:
- Can be reused in multiple places (landing page, newsletter archive, etc.)
- Client-side validation provides immediate feedback
- Graceful error handling with clear messaging in Korean

## API Enhancement Strategy

**Decision**: Extend existing GET endpoint with query parameter instead of creating new endpoint

**Rationale**:
- Maintains RESTful principles (one resource, one endpoint)
- Query parameter clearly indicates different response format
- Avoids endpoint proliferation
- Backward compatible with existing code

## Stats Endpoint Authentication

**Decision**: Make stats endpoint public (no authentication required)

**Rationale**:
- Subscriber count is not sensitive information
- Encourages transparency and trust
- Simplifies client-side implementation
- Social proof for potential subscribers

## Form Validation Approach

**Decision**: Use `noValidate` with JavaScript validation instead of HTML5 validation

**Rationale**:
- Better control over error messaging (Korean language)
- Easier to test programmatically
- Consistent validation behavior across browsers
- Custom styling for error states

## Newsletter Display on Landing

**Decision**: Show 3 most recent newsletters with link to full archive

**Rationale**:
- Enough to show activity without overwhelming
- Encourages exploration via "view all" link
- Maintains clean, focused design
- Responsive layout works well with 3 cards
