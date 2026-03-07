# Fix API Data Inconsistency

## Problem

El sistema tiene un **bug crítico** causado por inconsistencias entre APIs y frontend:

```
TypeError: Cannot read properties of undefined (reading 'filter')
at src/app/series/[id]/page.tsx:149
```

**Causa raíz**: `/api/series/[id]` no incluye `chapters` en los volúmenes, pero el frontend intenta hacer `.filter()` sobre ellos.

## Root Cause Analysis

```
┌────────────────────────────────────────────┐
│ API Response                               │
├────────────────────────────────────────────┤
│ volumes: {                                 │
│   include: {                               │
│     _count: { chapters: true }  ← Solo    │
│   }                             count     │
│ }                                          │
│                                            │
│ Frontend expects:                          │
│ volume.chapters.filter(...)   ← undefined │
└────────────────────────────────────────────┘
```

## Solution

**3-Phase Approach**:

### Phase 1: Critical Fix (10-15 min)
- Fix `/api/series/[id]` to include chapters
- Immediate crash resolution

### Phase 2: Defensive Frontend (30-45 min)
- Add optional chaining (`?.`) to all array accesses
- Protect against future API changes
- Follow pattern from home page

### Phase 3: Validation (15-20 min)
- Build verification
- Comprehensive manual testing
- Ensure no regressions

## Files Affected

### Backend
- `src/app/api/series/[id]/route.ts` - Include chapters in volumes

### Frontend
- `src/app/series/[id]/page.tsx` - Optional chaining
- `src/app/creator/series/[id]/page.tsx` - Optional chaining
- `src/app/creator/volumes/[id]/page.tsx` - Optional chaining
- `src/app/creator/chapters/[id]/page.tsx` - Optional chaining
- `src/app/read/[id]/page.tsx` - Fallback for pages

## Artifacts

- **[proposal.md](./proposal.md)** - Why this change is needed
- **[design.md](./design.md)** - Architecture and design decisions
- **[tasks.md](./tasks.md)** - Implementation checklist (11 tasks, 44 subtasks)
- **[specs/api-contracts/spec.md](./specs/api-contracts/spec.md)** - API contract specification

## Status

🟡 **Ready for implementation**

## Estimated Effort

**Total**: 1-2 hours
- Phase 1: 10-15 min (Critical)
- Phase 2: 30-45 min (High priority)
- Phase 3: 15-20 min (Validation)

## Risk Level

**Low** - Defensive changes, well-defined scope, easy rollback

## Next Steps

To implement this change:
```bash
# Exit explore mode
# Then:
/opsx-apply fix-api-data-inconsistency
```

## Impact

- ✅ Fixes critical crash on `/series/[id]` route
- ✅ Prevents similar crashes in creator routes
- ✅ Improves robustness of data handling
- ✅ Establishes consistent API contracts
- ⚠️ Slightly larger API payload for series detail (+6KB)
