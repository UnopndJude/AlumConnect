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

- Test files in `__test__/` directory
- Custom setup with accessibility testing support in `vitest.setup.ts`
- Use React Testing Library patterns for component testing

## Notes

- Uses pnpm for package management
- Testing uses Vitest with React plugin for component testing
- Global styles in `src/app/globals.css` include CSS custom properties for theming
- Favicon and app icons configured in `public/`