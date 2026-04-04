## Context

Panels currently authenticates users with NextAuth v4, magic links via Resend, and custom JWT/session callbacks to surface `role` and `showAdult`. The app also depends on session-aware route protection for `/creator`, `/read`, and `/admin`, and it uses Prisma with PostgreSQL as the source of truth for app data.

Better Auth is a better fit for the next stage of the project because it has an explicit migration path from NextAuth, built-in magic-link support, Prisma integration, and a cleaner way to extend session data. The migration is cross-cutting because it touches login, sessions, protected routes, database schema, and client helpers.

Stakeholders:
- Readers, who should keep the same login and access behavior
- Creators, who need stable access to creator tools
- Admins, who need reliable privilege checks
- Maintainers, who need a simpler auth stack with a clearer upgrade path

## Goals / Non-Goals

**Goals:**
- Replace NextAuth with Better Auth without changing the user-facing login experience
- Preserve email magic-link sign-in
- Preserve `role` and `showAdult` in session data
- Keep the app on PostgreSQL + Prisma
- Make protected routes work cleanly in Next.js 16
- Provide a safe migration path for existing users and sessions

**Non-Goals:**
- Changing the product's auth method away from magic links
- Adding social login, passkeys, or email/password in this change
- Changing the app database provider
- Redesigning the login UI beyond the auth library swap
- Refactoring unrelated product flows like reading, uploads, or moderation

## Decisions

### Decision 1: Use Better Auth with Prisma-backed persistence

**Decision**: Use Better Auth plus the Prisma adapter, keeping PostgreSQL as the auth store.

**Rationale**:
- The app already uses Prisma and PostgreSQL
- Better Auth's Prisma integration supports schema generation and migration
- Keeping persistence in the same database avoids introducing a second auth store
- The existing app-specific user fields already live in the current schema

**Alternatives Considered**:
1. **Stateless Better Auth sessions**
   - Pros: simpler session transport and fewer DB reads
   - Cons: less aligned with the current database-backed auth model and migration work
   - Rejected: this change needs a controlled cutover and existing user migration
2. **Keep NextAuth and patch the current stack**
   - Pros: smallest immediate code churn
   - Cons: preserves a fragile auth layer and keeps us on a path we already need to unwind
   - Rejected: the goal is to complete the migration

### Decision 2: Keep magic-link login and custom session claims

**Decision**: Use Better Auth's magic-link plugin and extend session data so the app can continue to read `id`, `role`, and `showAdult`.

**Rationale**:
- Users already understand the login flow
- The app's authorization logic depends on role-aware sessions
- Better Auth supports custom session shaping and typed client/server access

**Alternatives Considered**:
1. **Switch to password login**
   - Pros: familiar pattern for some apps
   - Cons: worse UX for this product and unnecessary for MVP
   - Rejected: it changes the product behavior
2. **Store role only in app tables and read it on every protected request**
   - Pros: avoids session extension work
   - Cons: more DB reads and more coupling in route checks
   - Rejected: the role should travel with the session

### Decision 3: Preserve existing users, invalidate active sessions

**Decision**: Keep user identities and app-specific profile data, but invalidate existing NextAuth sessions during the cutover.

**Rationale**:
- Existing users should not have to create new accounts
- Session semantics change enough that a hard cutover is simpler and safer
- The number of active users is small enough that re-authentication is acceptable

**Alternatives Considered**:
1. **Dual-running NextAuth and Better Auth**
   - Pros: no forced re-login
   - Cons: complexity, ambiguity, and a longer migration window
   - Rejected: too risky for the gain
2. **In-place adapter shim with no session invalidation**
   - Pros: smoother transition
   - Cons: fragile and hard to reason about
   - Rejected: not worth the maintenance burden

### Decision 4: Move route protection to Better Auth compatible Next.js 16 handling

**Decision**: Update the current protection layer to follow Better Auth's Next.js 16 integration model, using server-side auth checks as the source of truth and route-level redirects for UX.

**Rationale**:
- Better Auth's docs recommend server-side auth checks rather than relying on middleware alone
- Next.js 16 favors the proxy model for request interception
- The app already needs route-level authorization for creators and admins

**Alternatives Considered**:
1. **Keep the old middleware unchanged**
   - Pros: minimal edits
   - Cons: couples the app to the old auth assumptions
   - Rejected: the auth stack is changing
2. **Move everything to client-side session gating**
   - Pros: easy to wire up
   - Cons: weaker protection and worse UX for direct navigation
   - Rejected: server-side protection is still required

## Risks / Trade-offs

- **Session cutover forces re-login** -> Mitigation: announce the cutover and deploy during a low-traffic window
- **Schema migration mismatch between NextAuth and Better Auth** -> Mitigation: validate the auth schema in staging before production
- **Protected routes break if session claims are not mapped correctly** -> Mitigation: verify `role` and `showAdult` in both server and client access paths
- **Next.js 16 proxy/middleware differences cause route regressions** -> Mitigation: test `/creator`, `/read`, and `/admin` directly after migration
- **Client code may still assume NextAuth session shapes** -> Mitigation: update shared auth typings and helper hooks together

## Migration Plan

1. Add Better Auth dependencies and config in a staging branch
2. Generate or migrate the auth schema against PostgreSQL
3. Map existing user records and preserve Panels-specific fields
4. Replace the NextAuth route handler with the Better Auth handler at the new `[...all]` route
5. Update the login page and shared auth client usage
6. Update route protection for creator, reader, and admin paths
7. Validate sign-in, session claims, and role-based access in staging
8. Deploy with a hard session cutover
9. Monitor login failures, access denials, and route errors after rollout

Rollback strategy:
- Revert to the previous NextAuth-based auth files
- Restore the old auth route handler
- Keep the database migration artifacts until the rollout is stable

## Open Questions

1. Should the cutover keep the current auth tables and map them, or should we generate fresh Better Auth tables and migrate users into them?
2. Should route interception live in `proxy.ts` for Next.js 16, or should we keep a thinner `middleware.ts` bridge during the transition?
3. Should session freshness or expiration be tuned now, or kept aligned with the current login lifespan for the first release?
