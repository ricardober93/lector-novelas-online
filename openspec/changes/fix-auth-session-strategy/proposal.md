## Why

The application uses NextAuth with database session strategy, but the session callback is written for JWT strategy. This causes `session.user.role` to be undefined, blocking admin users from accessing `/admin`. Additionally, the current database strategy prevents middleware from verifying roles (requires DB access in Edge Runtime), and creates unnecessary DB load with 1000+ expected concurrent users.

## What Changes

- Change NextAuth session strategy from "database" to "jwt" in `src/lib/auth.ts`
- **BREAKING**: All existing sessions will be invalidated; users must re-authenticate
- Remove dependency on database sessions table for session management
- Enable middleware-based role verification (previously blocked by database strategy)
- Reduce database load by eliminating session lookups on every request

## Capabilities

### New Capabilities
- `middleware-role-protection`: Middleware can verify user roles (ADMIN, CREATOR, READER) and block/allow access to protected routes before page load

### Modified Capabilities
- `fix-page-not-working`: Session callback will now correctly populate `session.user.role` using JWT token instead of undefined database session lookup

## Impact

**Code Changes:**
- `src/lib/auth.ts`: 1 line change (session.strategy)
- `src/middleware.ts`: Can now implement role-based protection (optional enhancement)

**Database:**
- `sessions` table becomes unused (can be truncated or kept for rollback)
- `accounts` table remains in use for email provider
- Reduced DB load: ~1000+ queries/minute eliminated

**User Experience:**
- Current sessions invalidated (requires re-login once)
- Admin page access restored for ADMIN role users
- Potential improvement in page load latency (no DB lookup)

**Security:**
- Sessions no longer immediately revocable (expire after 30 days)
- Role changes apply on next login (not immediately)
- Acceptable tradeoff given rare need for immediate revocation
