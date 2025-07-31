# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AlumConnect is a web application for the Incheon Science High School (인천과학고등학교) alumni community, built with Next.js 15 and TypeScript.

## Development Commands

```bash
# Development
pnpm dev                   # Start development server

# Building and Production
pnpm build                 # Create production build
pnpm start                 # Start production server

# Code Quality
pnpm lint                  # Run ESLint
pnpm format                # Format code with Prettier
pnpm check-format          # Check formatting without changes

# Testing
pnpm test                  # Run tests with Vitest
pnpm test:watch            # Watch mode for tests
pnpm test:ui               # Vitest UI interface
pnpm test:coverage         # Generate test coverage report
```

## Architecture

- **Framework**: Next.js 15.2.0 with App Router (`src/app/` directory)
- **Language**: TypeScript with strict mode
- **Styling**: Tailwind CSS v4 with PostCSS, dark mode support
- **Testing**: Vitest with React Testing Library and jsdom
- **Fonts**: Custom Korean fonts (Pretendard, NanumSquareNeo) in `public/fonts/`

## Path Aliases

- `@/*` maps to `./src/*`

## Code Style

- No semicolons, 2-space indentation, 80-character line width
- ESLint with Next.js and TypeScript rules
- Prettier with Tailwind CSS plugin

## Testing

### Test Structure
- Test files in `__test__/` directory, mirroring the `src/` structure
- Custom setup with accessibility testing support in `vitest.setup.ts`
- Use React Testing Library patterns for component testing

### Testing Guidelines

**IMPORTANT: Always write tests when adding new features or components.**

#### 1. Library Functions (`__test__/lib/`)
- Test all database operations and business logic
- Mock external dependencies
- Test both success and error cases
- Example: `__test__/lib/database.test.ts`, `__test__/lib/introductions.test.ts`

#### 2. React Components (`__test__/components/`)
- Test user interactions and form submissions
- Mock async functions with `vi.fn()`
- Test accessibility and form validation
- Use `userEvent` for realistic user interactions
- Example: `__test__/components/auth/RegisterForm.test.tsx`

#### 3. API Routes (`__test__/api/`)
- Mock Next.js cookies and database functions
- Test authentication and authorization
- Test request validation and error handling
- Use `NextRequest` for request mocking
- Example: `__test__/api/auth/register.test.ts`

#### 4. Test Patterns
```typescript
// Component testing pattern
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

// API testing pattern
import { vi } from 'vitest'
vi.mock('@/lib/database')

// Always test edge cases
- Empty inputs, invalid data
- User not logged in, not authorized
- Server errors and network failures
```

#### 5. When Adding New Features
**MANDATORY**: Create corresponding test files for:
- New database functions → `__test__/lib/[filename].test.ts`
- New components → `__test__/components/[path]/[component].test.tsx`
- New API routes → `__test__/api/[route]/[method].test.ts`

#### 6. Test Coverage
- Aim for high test coverage on critical business logic
- Run `pnpm test:coverage` to check coverage reports
- Focus on testing user flows and edge cases

## Notes

- Uses pnpm for package management
- Testing uses Vitest with React plugin for component testing
- Global styles in `src/app/globals.css` include CSS custom properties for theming
- Favicon and app icons configured in `public/`