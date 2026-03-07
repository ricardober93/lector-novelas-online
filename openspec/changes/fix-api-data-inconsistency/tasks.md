# Tasks: Fix API Data Inconsistency

## Phase 1: Critical API Fix (3 tasks)

### Task 1.1: Fix /api/series/[id] to include chapters
- [x] Update Prisma query in `/api/series/[id]/route.ts`
- [x] Add `chapters` to `volumes.include`
- [x] Include fields: id, number, title, pageCount, status
- [x] Add `orderBy: { number: "asc" }` to chapters
- [x] Keep `_count` for backwards compatibility
- [ ] Test API response with Postman/curl
- [ ] Verify chapters array is present in response

### Task 1.2: Verify /api/series/[id] response structure
- [ ] Make GET request to `/api/series/[id]` with valid ID
- [ ] Verify response includes `series.volumes[].chapters[]`
- [ ] Verify chapters have required fields
- [ ] Verify ordering by chapter number
- [ ] Check server logs for errors
- [ ] Document response structure in comments

### Task 1.3: Test crash is fixed
- [ ] Navigate to `/series/[id]` route in browser
- [ ] Verify no `undefined.filter()` error in console
- [ ] Verify chapters display correctly
- [ ] Test with series that has multiple volumes
- [ ] Test with series that has no volumes
- [ ] Test with series that has volumes but no chapters

## Phase 2: Defensive Frontend (5 tasks)

### Task 2.1: Fix src/app/series/[id]/page.tsx
- [x] Add optional chaining to `series.volumes?.map`
- [x] Add optional chaining to `volume.chapters?.filter`
- [x] Add nullish coalescing with `?? []` fallback
- [ ] Add null check for series before rendering
- [ ] Test with valid series ID
- [ ] Test with invalid series ID
- [ ] Test with series with empty volumes
- [ ] Verify no console errors

### Task 2.2: Fix src/app/creator/series/[id]/page.tsx
- [x] Add optional chaining to `series.volumes?.length`
- [x] Add optional chaining to `series.volumes?.map`
- [x] Add nullish coalescing with `?? 0` for length checks
- [x] Add nullish coalescing with `?? []` for map operations
- [ ] Test navigation to creator series detail
- [ ] Verify volumes display correctly
- [ ] Test with series with no volumes
- [ ] Verify no console errors

### Task 2.3: Fix src/app/creator/volumes/[id]/page.tsx
- [x] Add optional chaining to `volume.chapters?.length`
- [x] Add optional chaining to `volume.chapters?.map`
- [x] Add nullish coalescing with `?? 0` for length checks
- [x] Add nullish coalescing with `?? []` for map operations
- [ ] Test navigation to creator volume detail
- [ ] Verify chapters display correctly
- [ ] Test with volume with no chapters
- [ ] Verify no console errors

### Task 2.4: Fix src/app/creator/chapters/[id]/page.tsx
- [x] Add optional chaining to `chapter.pages?.length`
- [x] Add optional chaining to `chapter.pages?.map`
- [x] Add nullish coalescing with `?? 0` for length checks
- [x] Add nullish coalescing with `?? []` for map operations
- [ ] Test navigation to creator chapter detail
- [ ] Verify pages display correctly
- [ ] Test with chapter with no pages
- [ ] Verify no console errors

### Task 2.5: Fix src/app/read/[id]/page.tsx
- [x] Add fallback to `pages={chapter.pages || []}`
- [ ] Add null check for chapter before rendering
- [ ] Test navigation to read page
- [ ] Verify reader displays pages
- [ ] Test with chapter with no pages
- [ ] Verify no console errors

## Phase 3: Validation (2 tasks)

### Task 3.1: Run build validation
- [x] Execute `npm run build`
- [x] Verify no TypeScript errors
- [x] Verify build completes successfully
- [x] Check for any new warnings
- [x] Document build results

**Build Results**: ✓ Compiled successfully in 4.8s. No TypeScript errors. All routes generated successfully.

### Task 3.2: Comprehensive manual testing
- [ ] Navigate to `/series/[id]` - verify no errors
- [ ] Navigate to `/creator/series/[id]` - verify no errors
- [ ] Navigate to `/creator/volumes/[id]` - verify no errors
- [ ] Navigate to `/creator/chapters/[id]` - verify no errors
- [ ] Navigate to `/read/[id]` - verify no errors
- [ ] Test all routes with empty data
- [ ] Test all routes with full data
- [ ] Test with slow network (devtools)
- [ ] Check browser console for errors
- [ ] Verify SWR fetching works correctly

## Phase 4: Documentation (Optional, 1 task)

### Task 4.1: Update API documentation
- [ ] Document `/api/series/[id]` response structure
- [ ] Document defensive frontend patterns
- [ ] Add comments to modified files
- [ ] Update AGENTS.md if needed
- [ ] Create examples of correct usage

## Summary

**Total Tasks**: 11 (44 subtasks)
**Estimated Effort**: 1-2 hours
**Risk Level**: Low (defensive changes, well-defined scope)

### Priorities

**P0 - Critical (Must do now)**:
- Phase 1: Fix API crash

**P1 - High (Should do soon)**:
- Phase 2: Defensive frontend

**P2 - Medium (Should do eventually)**:
- Phase 3: Validation

**P3 - Low (Nice to have)**:
- Phase 4: Documentation

### Success Criteria

- [ ] No crashes when navigating to any route
- [ ] No console errors
- [ ] Build passes without errors
- [ ] All manual tests pass
- [ ] Defensive patterns in place
