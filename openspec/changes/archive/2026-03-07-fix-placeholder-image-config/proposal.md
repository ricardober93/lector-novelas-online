# Proposal: Fix Placeholder Image Configuration

## Overview

Configure Next.js to allow placeholder images from `via.placeholder.com` for development seed data, fixing console errors when rendering series with placeholder cover images.

## Problem Statement

### Current Behavior
The seed script (`prisma/seed.ts`) creates test data with placeholder images from `via.placeholder.com`:
- 10 series with cover images: `via.placeholder.com/400x600`
- 1500 pages with page images: `via.placeholder.com/800x1200`

When the home page renders these series, Next.js throws a console error:

```
Invalid src prop (https://via.placeholder.com/...) on `next/image`, 
hostname "via.placeholder.com" is not configured under images in your `next.config.js`
```

### Root Cause
`next.config.ts` only allows images from `*.blob.vercel-storage.com` (production storage), but not from `via.placeholder.com` (development placeholders).

## Proposed Solution

### Option A: Add via.placeholder.com to remotePatterns (CHOSEN)

Add `via.placeholder.com` to the `images.remotePatterns` array in `next.config.ts`.

**Why this approach:**
- Minimal change (1 config entry)
- Immediate fix
- No code changes required
- Standard Next.js pattern for external images

**Trade-offs:**
- Depends on external service
- Only appropriate for development (placeholders are test data)

### Alternative Considered: Placeholder Component

Create a custom component that renders CSS/SVG placeholders instead of loading external images.

**Pros:** No external dependency, faster, works offline
**Cons:** More code, not real images, overkill for dev-only issue

**Decision:** Option A is sufficient for now. Placeholders are development-only. Production uses Vercel Blob Storage (already configured).

## Scope

### In Scope
- Update `next.config.ts` to allow `via.placeholder.com`
- Add comment explaining this is for development seed data only
- Document in README or relevant docs

### Out of Scope
- Changing seed script
- Creating placeholder component
- Modifying any components
- Production image handling (already works via Vercel Blob)

## Success Criteria

1. No console errors when loading home page with seed data
2. Placeholder images render correctly in development
3. Production images continue to work (Vercel Blob)
4. Configuration is documented

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| via.placeholder.com unavailable | Acceptable for dev only; production uses Vercel Blob |
| Performance impact | Minimal; only affects pages with seed data |
| Confusion about config | Add clear comment explaining dev-only purpose |

## Estimated Effort

- Configuration update: 5 minutes
- Testing: 5 minutes
- Documentation: 5 minutes
- **Total:** ~15 minutes

## Dependencies

- Existing Next.js config (✓)
- Existing seed script (✓)
