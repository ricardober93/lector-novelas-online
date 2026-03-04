## Context

The application uses NextAuth.js with PrismaAdapter and email magic link authentication. When users authenticate via magic link, the system creates User and Session records but fails to create Account records. This breaks the authentication state and causes 401 errors in API endpoints.

Current flow:
1. User clicks magic link
2. NextAuth verifies token via `useVerificationToken`
3. PrismaAdapter creates/updates User record
4. Session record is created
5. **MISSING**: Account record is NOT created

The Account table is part of NextAuth's standard schema and should contain provider-specific information. For email authentication, it should have:
- `provider`: "email"
- `type`: "email"
- `providerAccountId`: user's email
- `userId`: reference to User

## Goals / Non-Goals

**Goals:**
- Ensure Account records are created during magic link authentication
- Fix 401 errors caused by incomplete authentication state
- Create migration script for existing users without Account records
- Maintain backward compatibility with existing authentication flows

**Non-Goals:**
- Changing the magic link authentication flow or user experience
- Modifying the database schema
- Adding new authentication providers
- Changing session management strategy

## Decisions

### Decision 1: Use signIn callback to ensure Account creation

**Chosen Approach:** Add logic in NextAuth's `signIn` callback to create Account record if it doesn't exist after successful authentication.

**Rationale:**
- Least invasive solution - doesn't require modifying PrismaAdapter
- Works with existing NextAuth event system
- Can be easily tested and rolled back
- Handles both new and existing users

**Alternatives Considered:**
1. **Override PrismaAdapter methods**: Too risky, could break other provider integrations
2. **Use NextAuth events**: Events fire after callbacks, making it harder to ensure Account exists before session creation
3. **Manual Account creation in API routes**: Would require changes across multiple files and could miss edge cases

### Decision 2: Migration strategy for existing users

**Chosen Approach:** Create a one-time migration script that generates missing Account records for existing users who authenticated via magic link.

**Rationale:**
- Existing users already have valid sessions but missing Accounts
- Script can be run independently of code deployment
- Easy to verify and rollback if needed

**Migration logic:**
```sql
INSERT INTO accounts (id, userId, type, provider, providerAccountId)
SELECT 
  gen_random_uuid(),
  u.id,
  'email',
  'email',
  u.email
FROM users u
WHERE NOT EXISTS (
  SELECT 1 FROM accounts a WHERE a.userId = u.id
);
```

### Decision 3: Validation and monitoring

**Chosen Approach:** Add logging and validation to detect missing Account records early.

**Rationale:**
- Helps identify if the fix works correctly
- Provides visibility into authentication flow
- Can alert on anomalies (users without Accounts)

**Implementation:**
- Add logger statements in signIn callback
- Log warning if Account creation fails
- Monitor authentication success/failure rates

## Risks / Trade-offs

**Risk 1: Race condition in Account creation**
- **Mitigation:** Use database transaction or upsert operation to ensure atomic Account creation

**Risk 2: Migration script creates duplicate Accounts**
- **Mitigation:** Use `NOT EXISTS` check and unique constraint on (userId, provider)

**Risk 3: Breaking existing sessions**
- **Mitigation:** Migration script runs before code deployment, test thoroughly in staging

**Risk 4: Performance impact of additional database operation**
- **Mitigation:** Account creation only happens once per user, minimal performance impact

**Trade-off: Additional database operation during sign in**
- Accepted: The overhead is minimal compared to the benefit of complete authentication state
- Account creation only happens on first authentication or if record is missing

## Migration Plan

### Pre-deployment
1. Run migration script in staging environment
2. Verify Account records are created correctly
3. Test magic link authentication end-to-end
4. Test API endpoints with authenticated users

### Deployment
1. Deploy code changes with signIn callback logic
2. Monitor authentication logs for errors
3. Verify new users get Account records automatically
4. Run migration script in production for existing users

### Rollback Strategy
1. Remove signIn callback logic
2. Keep migration script - Account records don't break anything
3. Users can still authenticate even with Account records present

### Post-deployment
1. Monitor 401 error rates - should decrease significantly
2. Verify all authenticated API endpoints work correctly
3. Check database for users without Account records - should be zero
