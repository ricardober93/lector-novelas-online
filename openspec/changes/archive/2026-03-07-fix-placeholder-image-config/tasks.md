# Tasks: Fix Placeholder Image Configuration

## Task 1: Update Next.js Configuration
**Priority**: Critical
**Estimated Time**: 5 minutes

### Description
Add `via.placeholder.com` to the `remotePatterns` array in `next.config.ts` to allow placeholder images from seed data.

### Acceptance Criteria
- [x] `via.placeholder.com` added to `remotePatterns`
- [x] Configuration includes descriptive comment explaining dev-only purpose
- [x] Configuration is valid TypeScript

### Implementation Steps
1. Open `next.config.ts`
2. Add new pattern to `remotePatterns` array:
   ```typescript
   {
     protocol: 'https',
     hostname: 'via.placeholder.com',
   },
   ```
3. Add comment explaining this is for development only
4. Verify TypeScript syntax

### Files to Modify
- `next.config.ts`

---

## Task 2: Test with Seed Data
**Priority**: High
**Estimated Time**: 5 minutes

### Description
Run the application with seed data to verify placeholder images load correctly.

### Acceptance Criteria
- [x] No console errors about unconfigured hostname
- [x] Home page loads without errors
- [x] Series cards display placeholder images
- [x] Comment explains why via.placeholder.com is configured
- [x] Comment notes it is for development only
- [x] Comment mentions production uses Vercel Blob

### Implementation Steps
1. Add comment above the new pattern:
   ```typescript
   // Development only: Placeholder images from seed script
   // Production uses Vercel Blob Storage (already configured)
   ```

### Files to Modify
- `next.config.ts`

---

## Task 4: Build Verification
**Priority**: High
**Estimated Time**: 2 minutes

### Description
Run production build to ensure no TypeScript errors and configuration is valid.

### Acceptance Criteria
- [x] `npm run build` completes without errors
- [x] No TypeScript errors
- [x] Build output shows no warnings about image configuration

### Testing Steps
1. Run `npm run build`
2. Verify build completes successfully
3. Check for any configuration warnings

### Files to Verify
- `next.config.ts`

---

## Task Summary

**Total Tasks**: 4
**Estimated Total Time**: ~15 minutes

**Priority Breakdown**:
- Critical: 1 task (configuration update)
- High: 2 tasks (testing, build verification)
- Medium: 1 task (documentation)

**Dependencies**:
- Task 1 must be completed first (configuration)
- Tasks 2-4 can be done in any order after Task 1

**Critical Path**: Task 1 → Task 2 → Task 4
