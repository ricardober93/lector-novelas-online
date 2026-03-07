# Design: Fix Placeholder Image Configuration

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    CURRENT STATE (BROKEN)                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  prisma/seed.ts                                                 │
│  └─ Creates: via.placeholder.com/400x600?text=Series+Title      │
│                                                                 │
│  Database                                                       │
│  └─ series.coverImage = "https://via.placeholder.com/..."       │
│                                                                 │
│  src/app/page.tsx                                               │
│  └─ <Image src={s.coverImage} />                                │
│                                                                 │
│  next.config.ts                                                 │
│  └─ remotePatterns: [*.blob.vercel-storage.com]                │
│      ❌ via.placeholder.com NOT in list                          │
│                                                                 │
│  Result: 💥 Console error                                      │
│  "hostname 'via.placeholder.com' is not configured"            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    PROPOSED STATE (FIXED)                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  next.config.ts                                                 │
│  └─ remotePatterns: [                                           │
│       *.blob.vercel-storage.com,  // Production images          │
│       via.placeholder.com         // Dev placeholders ← NEW    │
│     ]                                                            │
│                                                                 │
│  src/app/page.tsx                                               │
│  └─ <Image src={s.coverImage} />                                │
│      ✅ Renders without errors                                   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Implementation Details

### next.config.ts Changes

Add `via.placeholder.com` to the `remotePatterns` array:

**Before:**
```typescript
const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.blob.vercel-storage.com',
      },
      {
        protocol: 'https',
        hostname: '**.public.blob.vercel-storage.com',
      },
    ],
  },
};
```

**After:**
```typescript
const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.blob.vercel-storage.com',
      },
      {
        protocol: 'https',
        hostname: '**.public.blob.vercel-storage.com',
      },
      {
        // Development only: Placeholder images for seed data
        // Production uses Vercel Blob Storage
        protocol: 'https',
        hostname: 'via.placeholder.com',
      },
    ],
  },
};
```

### Why This Approach

1. **Minimal change**: Single configuration entry
2. **Clear intent**: Comment explains dev-only purpose
3. **No code changes**: Seed script and components unchanged
4. **Backwards compatible**: Production images unaffected
5. **Easy to remove**: If we later implement placeholder components

### Security Considerations

**Q: Is it safe to allow via.placeholder.com?**

A: Yes, for development:
- Images are served over HTTPS
- via.placeholder.com is a well-known service
- Only affects development environment
- Production will never have placeholder URLs in database
- No user-uploaded content uses this domain

**Q: What about production?**

A: Production safety is maintained:
- Real images come from Vercel Blob (already configured)
- Seed script has environment guard (blocks production)
- Placeholder URLs only exist in development databases
- Even if placeholder URL somehow appeared in production, it would still work (no security risk)

### Performance Considerations

**Impact: Minimal**
- Only affects pages rendering seed data
- External request to via.placeholder.com (fast CDN)
- Only loads when seed data exists
- Production uses Vercel Blob (configured separately)

### Alternative: Environment-Specific Config

We could make the config environment-specific:

```typescript
const remotePatterns = [
  {
    protocol: 'https',
    hostname: '**.blob.vercel-storage.com',
  },
  {
    protocol: 'https',
    hostname: '**.public.blob.vercel-storage.com',
  },
];

// Only add placeholder.com in development
if (process.env.NODE_ENV === 'development') {
  remotePatterns.push({
    protocol: 'https',
    hostname: 'via.placeholder.com',
  });
}
```

**Decision: Not doing this because:**
- Adds complexity
- Config would be dynamic (harder to reason about)
- Not necessary (production is safe either way)
- via.placeholder.com is harmless in production

### Documentation Updates

Add note to README.md about placeholder images:

```markdown
### Placeholder Images

The seed script uses `via.placeholder.com` for test images:
- Cover images: 400x600px
- Page images: 800x1200px

This is configured in `next.config.ts` under `images.remotePatterns`.

**Note:** These are for development only. Production uses Vercel Blob Storage.
```

## Testing Strategy

### Manual Testing

1. Run seed script: `npx prisma db seed`
2. Start dev server: `npm run dev`
3. Open home page: `http://localhost:3000`
4. Verify:
   - [ ] No console errors about unconfigured hostname
   - [ ] Series cards show placeholder images
   - [ ] Images load correctly

### Build Verification

1. Run build: `npm run build`
2. Verify no TypeScript errors
3. Verify build completes successfully

## Future Considerations

### Potential Future Enhancement: Placeholder Component

If we want to remove dependency on via.placeholder.com:

1. Create `<PlaceholderImage />` component
2. Detect placeholder URLs in component
3. Render CSS/SVG placeholder instead
4. Update seed script to use special URL pattern

**Benefits:**
- No external dependency
- Faster (no network request)
- Works offline
- Better control over appearance

**Decision:** Not implementing now because:
- via.placeholder.com is reliable
- External requests are acceptable for dev
- Current solution is simpler
- Can implement later if needed

## Rollback Plan

If issues arise:
1. Remove `via.placeholder.com` from remotePatterns
2. Implement placeholder component (Alternative B)
3. Or use local placeholder images (Alternative C)

No database changes required. No code changes to seed script.
