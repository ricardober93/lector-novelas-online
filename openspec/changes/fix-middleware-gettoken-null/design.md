## Context

The application uses NextAuth v4 with database session strategy (not JWT). When a user authenticates via magic link:
1. A session record is created in the database
2. A session cookie (`next-auth.session-token`) contains the session ID
3. No JWT token is stored in cookies

The current middleware attempts to use `getToken()` from `next-auth/jwt` which:
- Looks for a JWT in cookies
- Tries to decode it using the JWT secret
- Returns `null` when no JWT exists (which is the case with database sessions)

Meanwhile, API route handlers already implement authentication using `getServerSession(authOptions)` which correctly reads the session ID from the cookie and looks up the session in the database.

## Goals / Non-Goals

**Goals:**
- Fix middleware authentication to work with database sessions
- Remove the null token issue blocking authenticated users
- Maintain same level of security for all routes
- Keep solution simple and maintainable

**Non-Goals:**
- Changing session strategy from database to JWT
- Adding new authentication mechanisms
- Modifying how API routes handle authentication (they already work correctly)
- Adding middleware-based session lookup (too complex for Edge Runtime)

## Decisions

### Decision 1: Remove API routes from middleware protection

**Chosen Approach:** Update middleware matcher to exclude `/api/*` routes, keeping only UI route protection.

**Rationale:**
- API routes already implement `getServerSession()` individually
- No duplication of authentication logic needed
- Middleware can't use `getServerSession()` (requires full NextAuth initialization)
- Simplest solution with no architectural changes

**Alternatives Considered:**

1. **Switch to JWT strategy**
   - Pros: `getToken()` would work
   - Cons: Violates non-goal (no strategy change), loses database session benefits
   
2. **Implement edge-compatible session lookup**
   - Pros: Keep API routes in middleware
   - Cons: Prisma doesn't work in Edge Runtime, would need Redis or REST API lookup
   
3. **Hybrid strategy (JWT + database adapter)**
   - Pros: Best of both worlds
   - Cons: More complex, changes session management behavior

## Risks / Trade-offs

**Risk 1: Inconsistent protection between UI and API routes**
- **Mitigation:** Both use same underlying session mechanism, just checked at different points. UI routes checked in middleware, API routes checked in handlers.

**Risk 2: API routes might be accessed without authentication check**
- **Mitigation:** Audit all API routes to confirm they use `getServerSession()`. All existing routes already implement this.

**Risk 3: Future middleware features won't apply to API routes**
- **Mitigation:** Document this decision. If middleware-based rate limiting or logging is needed later, revisit architecture.

**Trade-off: Middleware no longer provides unified entry point**
- Accepted: Simplicity and working authentication outweigh architectural purity
- API routes can implement their own middleware/functions for cross-cutting concerns

## Migration Plan

### Pre-deployment
1. Verify all API routes use `getServerSession()`
2. Test authenticated access to API routes directly
3. Document which routes are protected where

### Deployment
1. Update middleware matcher configuration
2. Deploy to staging
3. Test UI route protection (should redirect unauthenticated users)
4. Test API route protection (should return 401 for unauthenticated requests)

### Rollback Strategy
1. Revert middleware matcher to include API routes
2. Note: Will still have null token issue, but middleware will run again

### Post-deployment
1. Monitor authentication success rates
2. Verify no unauthorized API access
3. Check logs for any authentication errors
