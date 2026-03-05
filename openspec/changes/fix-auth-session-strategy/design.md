## Context

The application currently uses NextAuth v4 with database session strategy (`strategy: "database"`), but the session callback is implemented as if using JWT strategy. This mismatch causes:

1. **Bug**: `session.user.role` is undefined because the jwt callback never executes with database strategy, so the token is empty
2. **Performance**: Every request requires a database lookup to fetch session data
3. **Middleware limitation**: Cannot verify roles in middleware (Edge Runtime cannot access database)

**Current Architecture:**
- Email magic link authentication (Resend)
- Session data stored in PostgreSQL (`sessions` table)
- Cookie contains session-token UUID (not JWT)
- Session callback tries to read from `token.role` (undefined)
- Admin users blocked from `/admin` due to missing role

**Scale Requirements:**
- 1000+ concurrent users expected
- Rare need for immediate session revocation
- No audit/compliance requirements for session tracking

## Goals / Non-Goals

**Goals:**
- Fix `session.user.role` being undefined (restore admin access)
- Enable middleware-based role verification
- Reduce database load by eliminating session lookups
- Improve request latency (no DB query per request)
- Maintain same authentication UX (magic link)
- Keep existing callback implementations (they work for JWT)

**Non-Goals:**
- Changing authentication provider (keep email magic link)
- Implementing immediate session revocation (not needed)
- Adding new role types or permissions
- Modifying API route authentication (they use `getServerSession` which works with both)
- Changing session expiration (keep 30 days)

## Decisions

### Decision 1: Change to JWT Strategy

**Chosen Approach:** Update `session.strategy` from "database" to "jwt" in `src/lib/auth.ts`

**Rationale:**
- Existing callbacks (`jwt` and `session`) are already written for JWT strategy
- Enables middleware role verification (critical requirement)
- Eliminates 1000+ DB queries/minute at scale
- Better performance: 0.1ms crypto vs 5-20ms DB lookup
- Stateless = easier horizontal scaling
- Acceptable tradeoff: no immediate revocation (rarely needed)

**Alternatives Considered:**

1. **Fix session callback for database strategy**
   ```typescript
   async session({ session, user }) {
     session.user.role = user.role; // Use user, not token
   }
   ```
   - Pros: Keeps database sessions, immediate revocation
   - Cons: Middleware still cannot verify roles, DB lookup per request, poor scalability
   - Rejected: Doesn't solve middleware requirement

2. **Hybrid approach (JWT + database sessions)**
   - Pros: Best of both worlds
   - Cons: More complex, NextAuth doesn't support this pattern well
   - Rejected: Over-engineering for our needs

3. **Implement edge-compatible session lookup (Redis)**
   - Pros: Keep database sessions, middleware works
   - Cons: Adds Redis dependency, complexity, cost
   - Rejected: JWT is simpler and sufficient

### Decision 2: Session Migration Strategy

**Chosen Approach:** Hard cutover - invalidate all existing sessions

**Rationale:**
- Only 1 active user (admin) during development
- Clean migration - no hybrid state
- Users re-authenticate once via magic link
- No complex migration code needed

**Alternatives Considered:**

1. **Gradual migration (dual strategy)**
   - Pros: No user disruption
   - Cons: Complex, requires custom adapter, not worth it for 1 user
   - Rejected: Over-engineering

2. **Keep both strategies running**
   - Pros: Zero downtime
   - Cons: NextAuth doesn't support this, would need two auth systems
   - Rejected: Not feasible

### Decision 3: Database Cleanup

**Chosen Approach:** Keep `sessions` table but unused (can truncate manually)

**Rationale:**
- Easy rollback if needed (revert strategy change)
- No schema migration required
- Table can be dropped later if JWT strategy proves stable
- Zero risk approach

**Alternatives Considered:**

1. **Drop sessions table immediately**
   - Pros: Clean schema
   - Cons: Complicates rollback
   - Rejected: Premature optimization

2. **Keep sessions table in use (dual write)**
   - Pros: Audit trail
   - Cons: No requirement, adds complexity
   - Rejected: Not needed

## Risks / Trade-offs

**Risk 1: Session revocation not immediate**
- **Impact**: If user role changes (e.g., ADMIN → READER), change applies on next login (up to 30 days)
- **Mitigation**: Acceptable given "rare need" requirement. If critical, implement JWT blacklist or shorter expiration (1 hour + refresh tokens)
- **Likelihood**: Low (role changes are infrequent)

**Risk 2: All users must re-authenticate**
- **Impact**: Current sessions invalidated, users get new magic link
- **Mitigation**: Only 1 active user during development. Schedule during low-traffic period in production
- **Likelihood**: Certain (this is the migration)

**Risk 3: JWT token size limits**
- **Impact**: Cookie size limited to ~4KB. If user data grows, could hit limit
- **Mitigation**: Only storing id, role, showAdult (minimal). Monitor token size if adding more claims
- **Likelihood**: Very low (current data is tiny)

**Risk 4: Loss of session audit trail**
- **Impact**: No database record of active sessions
- **Mitigation**: No audit requirement specified. Can add logging if needed later
- **Likelihood**: N/A (not a requirement)

**Trade-off: Simplicity vs Features**
- **Accepted**: No immediate revocation, no session audit
- **Gained**: Better performance, middleware roles, simpler architecture, scalability

## Migration Plan

### Pre-deployment
1. Verify JWT callback implementation is correct (already done in auth.ts:163-179)
2. Verify session callback implementation is correct (already done in auth.ts:180-187)
3. Document current active sessions count (currently: 1)
4. Prepare communication for users (if any beyond admin)

### Deployment
1. Update `src/lib/auth.ts`: change `strategy: "database"` to `strategy: "jwt"`
2. Commit and deploy
3. Monitor authentication success rates

### Post-deployment
1. Admin user re-authenticates via magic link
2. Verify `session.user.role` is populated correctly
3. Verify `/admin` page accessible
4. Test middleware role verification (if implemented)
5. Monitor application logs for auth errors
6. Optional: `TRUNCATE sessions;` (table no longer used)

### Rollback Strategy
1. Revert `strategy: "jwt"` back to `strategy: "database"`
2. Deploy revert
3. Users re-authenticate again
4. Sessions table resumes normal operation
5. Investigate JWT strategy issue

**Rollback Triggers:**
- Authentication success rate drops below 95%
- Users unable to login after magic link
- Critical feature broken (e.g., can't create content)

### Success Criteria
- ✅ Admin can access `/admin` page
- ✅ `session.user.role` === "ADMIN" for admin user
- ✅ No database queries for session lookups (check query logs)
- ✅ Authentication success rate > 99%
- ✅ No increase in authentication-related errors

## Open Questions

1. **Should we implement middleware role protection immediately or as separate change?**
   - Recommendation: Separate change (`enhance-middleware-role-protection`) to keep this change focused
   - Current change unblocks the capability, next change implements it

2. **Should we reduce session expiration from 30 days to something shorter?**
   - Recommendation: Keep 30 days for now, monitor. Can reduce later if needed
   - Shorter expiration = more frequent re-authentication (worse UX)

3. **Should we add JWT token logging for debugging?**
   - Recommendation: No, keep minimal. Can add later if debugging needed
   - Logging tokens = security risk if logs leaked
