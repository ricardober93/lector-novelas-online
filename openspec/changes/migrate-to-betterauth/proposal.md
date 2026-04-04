## Why

The current authentication stack is built on NextAuth v4 and has accumulated migration-specific fixes around session strategy, account creation, and route protection. Better Auth gives us a cleaner long-term path for magic-link login, custom session fields, and Next.js 16 integration while keeping the user experience unchanged.

## What Changes

- Replace NextAuth with Better Auth for authentication and session management
- Keep email magic-link login as the primary sign-in flow
- Preserve `role` and `showAdult` as first-class session claims for route protection and UI logic
- Migrate the auth route handler to Better Auth's Next.js integration
- Replace the current client auth helpers with Better Auth client helpers
- Update protected route checks to work with the new auth model in Next.js 16
- Migrate the auth database schema and preserve existing user identities
- **BREAKING**: Existing NextAuth sessions will be invalidated and users must sign in again

## Capabilities

### New Capabilities
- `betterauth-authentication`: Better Auth-backed magic-link login, session management, and session claims for Panels

### Modified Capabilities
- None

## Impact

- `src/lib/auth.ts` will be replaced with Better Auth configuration
- `src/app/api/auth/[...all]/route.ts` will be replaced by a Better Auth route handler
- `src/app/login/page.tsx` will use Better Auth client sign-in
- `src/types/next-auth.d.ts` and related auth typings will be replaced or refactored
- `src/middleware.ts` or the Next.js 16 proxy layer will be updated for Better Auth compatible protection
- Prisma schema and migration steps will change to match Better Auth's auth models
- Existing NextAuth tables and session records will need a migration or cutover plan
- The application stays on the current PostgreSQL + Prisma stack; no database provider change is required
