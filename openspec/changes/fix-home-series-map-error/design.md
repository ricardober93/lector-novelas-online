## Context

The homepage (`src/app/page.tsx`) fails to render when the `/api/series` endpoint returns data. Investigation reveals:
- API returns: `{ series: SeriesWithChapterCount[] }` (wrapped object)
- Client expects: `Series[]` (direct array)
- Result: `TypeError: series.map is not a function` at line 121

Other consumers of the same API (`creator/page.tsx`, `series/[id]/page.tsx`) correctly expect the wrapped structure, so the API contract is fine - only the home page needs fixing.

Additionally, the current error handling is brittle:
- Single global ErrorBoundary in layout.tsx
- Any section failure breaks the entire page
- No loading skeletons (just plain "Cargando..." text)
- No retry mechanism for transient failures

## Goals / Non-Goals

**Goals:**
- Fix the immediate `series.map` error with defensive validation
- Improve UX with skeleton loading states
- Isolate failures with section-level error boundaries
- Add retry mechanism for failed API calls
- Maintain existing functionality (no breaking changes to other pages)

**Non-Goals:**
- Backend API changes (contract is correct as-is)
- Global architectural refactoring
- Offline support or caching beyond SWR defaults
- Performance optimizations beyond UX improvements

## Decisions

### 1. Fix Data Handling (Client-Side)

**Decision:** Extract series array from wrapper + defensive validation

```typescript
// Before
const { data: series = [] } = useSWR<Series[]>("/api/series?limit=12", fetcher);

// After
const { data: seriesData, error: seriesError, isLoading } = 
  useSWR<{ series: Series[] }>("/api/series?limit=12", fetcher);

const series = Array.isArray(seriesData?.series) 
  ? seriesData.series 
  : [];
```

**Rationale:** 
- API contract is correct (other pages use it properly)
- Minimal change scope (only fix what's broken)
- Defensive validation prevents future similar errors

**Alternatives considered:**
- Change API to return direct array: ❌ Would break other consumers
- Normalizer in fetcher: ❌ Adds complexity, hard to know which endpoints need it
- Keep as-is: ❌ Error persists

### 2. Loading States with Skeletons

**Decision:** Create reusable skeleton components

```typescript
<SeriesCardSkeleton /> // For series grid
<HistoryItemSkeleton /> // For reading history
```

**Rationale:**
- Better perceived performance (visual feedback vs plain text)
- Reusable across pages
- Simple shimmer animation with Tailwind

**Alternatives considered:**
- Keep "Cargando..." text: ❌ Poor UX
- Third-party skeleton library: ❌ Overkill, can build with Tailwind
- Skeleton per component: ❌ Too granular, prefer section-level

### 3. Section-Level Error Boundaries

**Decision:** Wrap each major section in ErrorBoundary

```typescript
<ErrorBoundary fallback={<HistoryErrorFallback />}>
  {/* Reading history section */}
</ErrorBoundary>

<ErrorBoundary fallback={<SeriesErrorFallback onRetry={mutate} />}>
  {/* Series grid section */}
</ErrorBoundary>
```

**Rationale:**
- Partial failures don't break entire page
- Better UX (some content visible even if part fails)
- Granular error recovery

**Alternatives considered:**
- Keep single global boundary: ❌ All-or-nothing UX
- No boundary (let errors propagate): ❌ Crashes entire app
- Per-component boundaries: ❌ Too granular, visual noise

### 4. Retry Mechanism

**Decision:** Use SWR's built-in `mutate()` function

```typescript
const { mutate } = useSWR(...);

// In error fallback
<button onClick={() => mutate()}>Reintentar</button>
```

**Rationale:**
- SWR already has retry capability
- No additional dependencies
- Simple to implement

**Alternatives considered:**
- Auto-retry with exponential backoff: ❌ Complex, may spam server
- Full page reload: ❌ Heavy, loses state
- Custom retry logic: ❌ Reinventing SWR features

## Risks / Trade-offs

**Risk:** Skeleton components add bundle size
→ **Mitigation:** Keep skeletons simple (no heavy dependencies), only load where needed

**Risk:** Multiple ErrorBoundaries increase component tree depth
→ **Mitigation:** Negligible performance impact, better resilience worth the trade-off

**Risk:** Defensive validation may hide future API contract changes
→ **Mitigation:** Add console.warn when structure is unexpected, keep validation explicit

**Trade-off:** Section-level boundaries mean more error states to test
→ **Acceptance:** Better UX, manageable test surface (2-3 sections)

## Migration Plan

1. **Phase 1:** Fix immediate error (defensive validation)
2. **Phase 2:** Add skeleton components
3. **Phase 3:** Wrap sections in ErrorBoundaries
4. **Phase 4:** Add retry buttons to error fallbacks

No database migrations or backend changes required.

## Open Questions

- Should reading history fail silently or show error? → **Decision:** Fail silently (not critical path)
- How many skeleton cards to show? → **Decision:** Match typical grid size (6 cards)
- Error boundary fallback styling: generic or section-specific? → **Decision:** Section-specific with retry option for series, silent for history
