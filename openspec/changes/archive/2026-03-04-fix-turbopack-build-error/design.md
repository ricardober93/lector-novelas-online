## Context

Turbopack (Next.js 13+ bundler) is experiencing a panic when compiling the /login page endpoint. The error occurs after modifying the authentication configuration in `src/lib/auth.ts`. TypeScript compilation succeeds, indicating the code is valid, but Turbopack's cached build artifacts are causing the panic.

Current error: "Turbopack Error: Failed to write app endpoint /login/page"

## Goals / Non-Goals

**Goals:**
- Clear corrupted Turbopack/Next.js cache
- Restore development server functionality
- Document the fix for future reference

**Non-Goals:**
- Modifying application code
- Changing Turbopack configuration
- Switching to Webpack

## Decisions

### 1. Clear all Next.js cache directories
**Choice:** Delete `.next` directory completely
**Rationale:** The `.next` directory contains all build artifacts including Turbopack cache. A complete clear ensures no stale artifacts remain.
**Alternatives:**
- Selective cache clear: More complex, risk of missing corrupted files
- Restart server only: Doesn't address root cause

### 2. Clear node_modules/.cache if exists
**Choice:** Remove any additional caches in node_modules
**Rationale:** Some tools (like Turbopack, Jest, etc.) cache in node_modules/.cache. Clearing ensures a clean slate.
**Alternatives:**
- Skip: May leave residual cache issues

## Risks / Trade-offs

- **Risk:** Full rebuild will take longer on next dev start
  - **Mitigation:** One-time cost; subsequent builds will be fast again

- **Risk:** Issue may recur with future Turbopack updates
  - **Mitigation:** Document the fix procedure for team reference
