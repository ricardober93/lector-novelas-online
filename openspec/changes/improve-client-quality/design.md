## Context

Panels is a manga/comic reading platform built with Next.js 16, React 19, and Prisma. After an extensive audit, we identified critical issues affecting performance, maintainability, and user experience:

- **Memory leaks** in the reader component due to improper IntersectionObserver cleanup
- **Upload UX issues** with no cancellation support leading to inconsistent states
- **Performance bottlenecks** from unoptimized images and lack of client-side caching
- **Type safety gaps** with `any` types reducing code reliability
- **Console noise** with 49 log statements in production code
- **Security concerns** with missing rate limiting and adult content validation

Current stack includes NextAuth for authentication, Prisma with PostgreSQL, Vercel Blob for storage, and Resend for emails. We use Tailwind CSS v4 for styling.

## Goals / Non-Goals

**Goals:**
- Eliminate memory leaks and race conditions in client components
- Improve performance metrics (Lighthouse score, TTI, bundle size)
- Establish proper error handling and logging practices
- Enhance type safety across the codebase
- Implement missing security features (rate limiting, adult content checks)
- Create foundation for sustainable code quality

**Non-Goals:**
- Major architectural refactoring (keep existing structure)
- UI/UX redesign (only fix broken interactions)
- Database schema changes
- API versioning or breaking changes
- Internationalization (i18n)
- Offline-first architecture (PWA features)

## Decisions

### 1. Logging Strategy: Environment-Aware Logger Utility

**Decision:** Create a centralized logger utility that respects `NODE_ENV`.

**Rationale:**
- Console.log statements expose sensitive information and degrade production performance
- Need structured logging for debugging without production noise
- Simple implementation without external dependencies

**Alternatives Considered:**
- **Winston/Pino:** Too heavy for current needs, adds complexity
- **Datadog/Sentry logging:** Overkill for this phase, can add later if needed

**Implementation:**
```typescript
// src/lib/logger.ts
const isDev = process.env.NODE_ENV === 'development';

export const logger = {
  log: (...args: any[]) => isDev && console.log(...args),
  error: (...args: any[]) => console.error(...args), // Always log errors
  warn: (...args: any[]) => isDev && console.warn(...args),
  debug: (...args: any[]) => isDev && console.debug(...args),
};
```

---

### 2. Upload Cancellation: AbortController Pattern

**Decision:** Use native AbortController API for upload cancellation.

**Rationale:**
- Native browser API, no dependencies
- Works with fetch API
- Provides clean abort mechanism
- Allows partial cleanup of completed uploads

**Alternatives Considered:**
- **Axios CancelToken:** Requires adding Axios dependency (currently using fetch)
- **Custom flag-based cancellation:** Less reliable, doesn't stop network requests

**Implementation:**
```typescript
const abortControllerRef = useRef<AbortController | null>(null);

const handleUpload = async () => {
  const controller = new AbortController();
  abortControllerRef.current = controller;
  
  try {
    for (const file of files) {
      if (controller.signal.aborted) break;
      
      await fetch('/api/pages', {
        method: 'POST',
        body: formData,
        signal: controller.signal,
      });
    }
  } catch (err) {
    if (err.name === 'AbortError') {
      // Handle cancellation gracefully
    }
  }
};

const handleCancel = () => {
  abortControllerRef.current?.abort();
};
```

---

### 3. Image Optimization: Next.js Image Component

**Decision:** Use Next.js Image component with dynamic priority and lazy loading.

**Rationale:**
- Built-in optimization (resize, format conversion)
- Automatic lazy loading
- Blur placeholder support
- Prevents layout shift with proper sizing
- Already installed (no new dependencies)

**Alternatives Considered:**
- **Custom img with loading="lazy":** Missing optimization, priority control
- **Third-party image CDN:** Adds cost and complexity, Vercel Blob already handles storage

**Implementation Strategy:**
1. Replace all `<img>` in reader with `<Image>`
2. First 3 images: `priority={true}`, `loading="eager"`
3. Remaining: `loading="lazy"`, `priority={false}`
4. Add blur placeholders for smooth loading
5. Handle width/height from API data

---

### 4. Client-Side Caching: SWR

**Decision:** Use SWR for client-side data fetching and caching.

**Rationale:**
- Lightweight (3KB gzipped)
- Built-in cache, revalidation, error handling
- Works with existing fetch API
- React hooks API fits our stack
- No breaking changes to existing code

**Alternatives Considered:**
- **TanStack Query:** More features but heavier (13KB)
- **Custom context + fetch:** Re-inventing the wheel, more code to maintain
- **No caching:** Poor UX, unnecessary network requests

**Implementation:**
```typescript
// src/lib/fetcher.ts
export const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch');
  return res.json();
};

// Usage
import useSWR from 'swr';
const { data, error, isLoading } = useSWR('/api/series', fetcher);
```

---

### 5. Rate Limiting: Upstash Redis + Ratelimit

**Decision:** Implement rate limiting using Upstash Redis.

**Rationale:**
- Serverless-friendly (Vercel compatible)
- Low latency (edge-compatible)
- Simple API
- Free tier sufficient for current scale
- Can upgrade to paid tier as we grow

**Alternatives Considered:**
- **In-memory rate limiting:** Doesn't work in serverless/multi-instance
- **Database-based:** Too slow, adds load to primary DB
- **Cloudflare Workers:** More complex setup, requires infrastructure changes

**Implementation:**
```typescript
// src/lib/rate-limit.ts
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(3, "1 h"), // 3 requests per hour
});

// In auth.ts
const { success } = await ratelimit.limit(email);
if (!success) {
  throw new Error("Too many requests. Please try again later.");
}
```

---

### 6. Memory Leak Fix: Refs + Cleanup Pattern

**Decision:** Use refs for DOM elements and ensure complete cleanup in useEffect.

**Rationale:**
- Direct DOM queries with `querySelector` are anti-pattern in React
- Refs are React's way to access DOM elements
- Proper cleanup prevents memory leaks
- Works with React 19's concurrent features

**Implementation:**
```typescript
const pageRefs = useRef<Map<string, HTMLElement>>(new Map());
const observerRef = useRef<IntersectionObserver | null>(null);

useEffect(() => {
  const observer = new IntersectionObserver(callback, options);
  observerRef.current = observer;
  
  pageRefs.current.forEach((el) => observer.observe(el));
  
  return () => {
    observer.disconnect();
    observerRef.current = null; // Clear ref
  };
}, [deps]);

// In JSX
<div ref={(el) => pageRefs.current.set(page.id, el)} />
```

---

### 7. Type Safety: Prisma Types + Type Guards

**Decision:** Replace `any` with proper Prisma types and runtime validation.

**Rationale:**
- Prisma generates accurate types for all models
- Type guards provide runtime safety
- Catches errors at compile time
- Improves IDE support and autocomplete

**Implementation:**
```typescript
// ❌ Before
const where: any = {};

// ✅ After
import { Prisma } from '@prisma/client';
const where: Prisma.SeriesWhereInput = {};

// Type guard for runtime validation
const isValidStatus = (status: string): status is SeriesStatus => {
  return ['ACTIVE', 'INACTIVE'].includes(status);
};
```

## Risks / Trade-offs

### Risk: Breaking Changes in Upload Flow
**Mitigation:** 
- Add cancellation as opt-in feature first
- Test extensively with edge cases (slow network, partial uploads)
- Provide clear UI feedback when upload is cancelled
- Keep existing upload flow working if AbortController is not supported (fallback)

### Risk: Image Optimization Increases Build Time
**Mitigation:**
- Use `unoptimized` prop for development environment
- Implement priority hints to optimize critical path only
- Monitor build times and adjust strategy if needed
- Consider using `placeholder="empty"` if blur is too slow

### Risk: Rate Limiting Blocks Legitimate Users
**Mitigation:**
- Start with generous limits (3 requests/hour for magic links)
- Log rate limit events for monitoring
- Implement exponential backoff on client side
- Provide clear error messages with retry guidance

### Risk: SWR Cache Invalidation Complexity
**Mitigation:**
- Define clear cache keys strategy
- Implement manual revalidation for critical actions (e.g., after upload)
- Document cache invalidation patterns for team
- Start with conservative revalidation settings

### Risk: Memory Leak Fixes May Cause New Bugs
**Mitigation:**
- Test reader component with rapid navigation
- Verify IntersectionObserver cleanup with React DevTools
- Monitor memory usage in production after deployment
- Keep rollback plan ready

### Risk: Type Safety Refactoring is Time-Consuming
**Mitigation:**
- Prioritize critical paths first (auth, data fetching)
- Use TypeScript strict mode incrementally
- Create utility types for common patterns
- Don't block other work on type fixes

## Migration Plan

### Phase 1: Critical Fixes (1-2 days)
**Deploy Strategy:** Rolling deployment, no downtime

1. **Create logger utility** (low risk)
   - Deploy logger.ts
   - Update imports in all files
   - Remove console.log statements
   - Test in staging

2. **Fix memory leaks** (medium risk)
   - Update ChapterReader with refs pattern
   - Test extensively in staging
   - Monitor memory usage after deployment
   - Rollback if memory usage increases

3. **Implement upload cancellation** (medium risk)
   - Add AbortController support
   - Update UI with cancel button
   - Test edge cases (slow network, rapid cancellation)
   - Deploy behind feature flag if concerned

4. **Move auth protection to middleware** (low risk)
   - Already have middleware, just add /read/* paths
   - Test authentication flow
   - Verify redirects work correctly

### Phase 2: Performance Improvements (2-3 days)
**Deploy Strategy:** Feature flags + gradual rollout

1. **Add SWR for caching**
   - Install dependency
   - Create fetcher utility
   - Migrate one page at a time (start with home page)
   - Monitor performance metrics
   - Expand to other pages

2. **Optimize images**
   - Update ChapterReader to use Next/Image
   - Add priority hints
   - Test with various image sizes
   - Monitor Lighthouse scores
   - Adjust strategy based on results

3. **Add prefetching**
   - Implement onMouseEnter prefetch for navigation
   - Test with slow network
   - Verify no unnecessary requests

### Phase 3: Code Quality (1-2 days)
**Deploy Strategy:** Continuous deployment

1. **Eliminate `any` types**
   - Start with API routes
   - Update client components
   - Run strict type checks

2. **Add email validation**
   - Client-side validation
   - Clear error messages
   - Test edge cases

3. **Fix CSS and UI issues**
   - Update font-family
   - Improve loading states
   - Test across browsers

### Phase 4: Security (Optional, 1 day)
**Deploy Strategy:** Feature flag + monitoring

1. **Implement rate limiting**
   - Set up Upstash Redis
   - Configure limits
   - Monitor for false positives
   - Adjust limits based on data

2. **Add adult content validation**
   - Check session.user.showAdult
   - Add redirect logic
   - Test with adult content

### Rollback Strategy

Each phase can be rolled back independently:

- **Logger:** Revert commits, no data impact
- **Memory leaks:** Revert ChapterReader changes
- **Upload cancellation:** Hide cancel button, keep existing flow
- **SWR:** Revert to direct fetch calls
- **Image optimization:** Revert to `<img>` tags
- **Rate limiting:** Disable in environment variables

### Monitoring & Success Criteria

**Metrics to Track:**
- Lighthouse Performance score (target: 85+)
- Time to Interactive (target: <2.5s)
- Memory usage in reader (target: stable, no growth over time)
- Upload success rate (target: >95%)
- Rate limit triggers (monitor for false positives)
- Error rates in production (target: <1%)

**Tools:**
- Vercel Analytics for performance
- Browser DevTools for memory profiling
- Custom logging for error tracking
- Upstash dashboard for rate limiting metrics

## Open Questions

1. **Should we implement progressive image loading for very long chapters?**
   - Current: Load all images on scroll
   - Alternative: Load chunks of images (e.g., 10 at a time)
   - Trade-off: Complexity vs performance for 50+ page chapters

2. **What's the right balance for rate limiting?**
   - Current plan: 3 magic links per hour
   - Need data on legitimate usage patterns
   - May need different limits for different endpoints

3. **Should we add error boundaries for component failures?**
   - Currently missing React error boundaries
   - Could improve error UX
   - Adds complexity to error handling

4. **Do we need offline support for reading?**
   - SWR provides some caching
   - Full PWA would require service workers
   - Scope creep for this change?

5. **Should we migrate to TypeScript strict mode?**
   - Would catch more errors at compile time
   - Requires fixing existing type issues first
   - Could be separate quality initiative
