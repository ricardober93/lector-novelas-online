# AGENTS.md - Coding Guidelines for Panels

This document provides essential information for agentic coding agents working in this Next.js application.

## Project Overview

**Panels** is a manga/comic/webtoon reading platform built with:
- **Framework**: Next.js 16.1.6 (App Router)
- **Language**: TypeScript 5 (strict mode)
- **Styling**: Tailwind CSS v4
- **Database**: PostgreSQL with Prisma ORM
- **Auth**: NextAuth v4 (magic link via Resend)
- **State**: SWR for data fetching
- **Testing**: Vitest + React Testing Library

## Build, Lint, and Test Commands

```bash
# Development
npm run dev                 # Start dev server on http://localhost:3000

# Production
npm run build              # Build for production (includes TypeScript check)
npm run start              # Start production server

# Linting
npm run lint               # Run ESLint (eslint-config-next)

# Testing (Vitest)
npx vitest                 # Run all tests
npx vitest path/to/test.ts # Run specific test file
npx vitest --watch         # Run tests in watch mode

# Database (Prisma)
npx prisma studio          # Open Prisma Studio GUI
npx prisma db push         # Push schema changes to database
npx prisma generate        # Generate Prisma Client
npx prisma migrate dev     # Create and apply migration
```

**IMPORTANT**: 
- Run `npm run build` after making changes to catch TypeScript errors
- There is no separate `typecheck` script - use `npm run build`
- Tests are located alongside source files: `Component.tsx` → `Component.test.tsx`

## Code Style Guidelines

### TypeScript

- **Strict mode enabled**: All TypeScript strict checks are ON
- **No `any` without justification**: Use `unknown` when type is truly unknown
- **Explicit return types**: Optional for small functions, required for exported functions
- **Interface vs Type**: Prefer `interface` for object shapes, `type` for unions/intersections

```typescript
// ✅ Good
interface Series {
  id: string;
  title: string;
  description: string | null;
}

export async function getSeries(): Promise<Series[]> {
  // ...
}

// ❌ Bad
function getSeries(): any {  // Avoid any
  // ...
}
```

### Imports Organization

Organize imports in this order:
1. React/Next.js directives (`"use client"`, `"use server"`)
2. React imports
3. Next.js imports
4. Third-party libraries (alphabetical)
5. Local imports using `@/` alias (alphabetical)
6. Relative imports (avoid when possible)

```typescript
"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";
import useSWR from "swr";
import { logger } from "@/lib/logger";
import { fetcher } from "@/lib/fetcher";
import { SeriesCard } from "@/components/SeriesCard";
```

### File Naming

- **Components**: PascalCase - `ErrorBoundary.tsx`, `SeriesCard.tsx`
- **Utilities**: camelCase - `fetcher.ts`, `logger.ts`, `historyNormalizer.ts`
- **API Routes**: lowercase with hyphens - `reading-history/route.ts`
- **Tests**: Same as source with `.test.tsx` or `.test.ts` suffix
- **Pages**: lowercase - `page.tsx`, `layout.tsx`

### Component Structure

```typescript
"use client";  // Only if client-side hooks/events used

import { useState } from "react";
import { logger } from "@/lib/logger";

interface ComponentProps {
  title: string;
  optional?: boolean;
}

export function Component({ title, optional }: ComponentProps) {
  const [state, setState] = useState<string>("");
  
  // Handlers
  const handleClick = () => {
    logger.log("Clicked");
  };
  
  // Early returns for loading/error states
  if (!title) {
    return null;
  }
  
  // Main render
  return (
    <div onClick={handleClick}>
      {title}
    </div>
  );
}
```

### Error Handling

**API Routes** - Always use try-catch with logger:
```typescript
export async function GET(request: NextRequest) {
  try {
    // ... logic
    return NextResponse.json({ data });
  } catch (error) {
    logger.error("Error in GET /api/series:", error);
    return NextResponse.json(
      { error: "Error al obtener series" },  // Spanish for users
      { status: 500 }
    );
  }
}
```

**Client-Side** - Use ErrorBoundary + defensive checks:
```typescript
// Defensive checks
const series = Array.isArray(seriesData?.series) ? seriesData.series : [];

// Error boundaries wrap sections
<ErrorBoundary fallback={<ErrorFallback />}>
  <Component />
</ErrorBoundary>
```

**Logging** - Always use logger, not console:
```typescript
import { logger } from "@/lib/logger";

logger.log("Debug info", data);      // Only logs in development
logger.error("Error occurred", err); // Always logs
logger.warn("Warning message");      // Only logs in development
```

### Data Fetching

**Client-Side** - Use SWR with typed fetcher:
```typescript
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";

interface Series {
  id: string;
  title: string;
}

const { data, error, isLoading, mutate } = useSWR<Series[]>(
  "/api/series",
  fetcher
);

const series = data || [];
```

**Server-Side (API Routes)** - Use Prisma:
```typescript
import { prisma } from "@/lib/prisma";

const series = await prisma.series.findMany({
  where: { status: "ACTIVE" },
  include: {
    _count: { select: { volumes: true } }
  }
});
```

### Authentication & Authorization

**Server-Side** - Use getServerSession:
```typescript
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const session = await getServerSession(authOptions);
if (!session) {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

// Role check
if (session.user.role !== "ADMIN") {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}
```

**Client-Side** - Use useSession:
```typescript
import { useSession } from "next-auth/react";

const { data: session, status } = useSession();

if (status === "loading") return <Loading />;
if (status === "unauthenticated") return <RedirectToLogin />;

// session.user.role is available
```

### Database Patterns

**Prisma Client Import**:
```typescript
import { prisma } from "@/lib/prisma";
import { Role, SeriesStatus } from "@prisma/client";
```

**Common Queries**:
```typescript
// Find with relations
const series = await prisma.series.findUnique({
  where: { id },
  include: {
    volumes: {
      include: { chapters: true }
    }
  }
});

// Create with relations
const chapter = await prisma.chapter.create({
  data: {
    volumeId,
    number: 1,
    status: "PENDING"
  }
});

// Update
await prisma.series.update({
  where: { id },
  data: { status: "ACTIVE" }
});
```

### Styling with Tailwind CSS v4

**Dark Mode** - Use `dark:` prefix:
```typescript
<div className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50">
```

**Common Patterns**:
```typescript
// Layouts
<div className="max-w-6xl mx-auto px-6 py-12">

// Cards
<div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6">

// Buttons
<button className="px-4 py-2 rounded-lg bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900">

// Forms
<input className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded-lg" />
```

### API Response Format

**Success**:
```typescript
return NextResponse.json({ 
  data: series,      // Or specific name: { series }
  count: 10          // Optional metadata
});
```

**Error**:
```typescript
return NextResponse.json(
  { error: "Mensaje de error en español" },
  { status: 400 }
);
```

### Testing Patterns

**Component Tests**:
```typescript
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";

describe("Component", () => {
  it("renders correctly", () => {
    render(<Component title="Test" />);
    expect(screen.getByText("Test")).toBeTruthy();
  });
});
```

**Run Tests**:
```bash
npx vitest Component.test.tsx  # Specific file
npx vitest --run               # All tests once
```

## Environment Variables

Required variables in `.env.local`:
```
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="..."
NEXTAUTH_URL="http://localhost:3000"
RESEND_API_KEY="re_..."
```

## Common Gotchas

1. **Next.js 16 App Router**: Use `"use client"` for client-side hooks
2. **Prisma**: Always import from `@/lib/prisma`, never create new instances
3. **Dates**: Prisma returns Date objects, format with `toLocaleDateString()`
4. **CUIDs**: IDs are CUIDs (e.g., `cmmcewjbi0000ug7p7g4zfbxc`)
5. **Spanish UI**: User-facing messages should be in Spanish
6. **Session Strategy**: Uses JWT (not database sessions)
7. **Middleware**: Cannot use Prisma (Edge Runtime) - use cookie checks only
8. **Path Alias**: Always use `@/` for imports from `src/`, avoid relative paths

## Key Files to Know

- `src/lib/auth.ts` - NextAuth configuration
- `src/lib/prisma.ts` - Prisma client singleton
- `src/lib/logger.ts` - Logging wrapper
- `src/lib/fetcher.ts` - SWR fetcher with error handling
- `src/middleware.ts` - Route protection
- `prisma/schema.prisma` - Database schema

## When Making Changes

1. **Always run** `npm run build` before committing to catch TypeScript errors
2. **Update Prisma schema**: Run `npx prisma generate` after schema changes
3. **Add tests** for new components/utilities in `.test.tsx` or `.test.ts` files
4. **Use logger** instead of `console.log` for debugging
5. **Handle errors** gracefully with user-friendly Spanish messages
6. **Check existing patterns** in similar files before implementing new features
7. **Update OpenSpec artifacts** if working on an active change
