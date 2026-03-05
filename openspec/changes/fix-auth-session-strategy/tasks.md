## 1. Pre-Implementation Verification

- [x] 1.1 Verify jwt callback implementation is correct (auth.ts:163-179)
- [x] 1.2 Verify session callback implementation is correct (auth.ts:180-187)
- [x] 1.3 Document current active sessions count
- [x] 1.4 Verify all API routes use getServerSession (no changes needed)

## 2. Core Implementation

- [x] 2.1 Update session strategy from "database" to "jwt" in src/lib/auth.ts
- [x] 2.2 Verify JWT secret is set in environment variables
- [ ] 2.3 Test authentication flow locally with magic link

## 3. Testing

- [ ] 3.1 Test admin user can access /admin page
- [ ] 3.2 Test session.user.role is populated correctly
- [ ] 3.3 Test non-admin user cannot access /admin page
- [ ] 3.4 Test creator user can access /creator page
- [ ] 3.5 Test reader user cannot access /creator page
- [ ] 3.6 Test unauthenticated user redirected to /login
- [ ] 3.7 Verify no database queries for session lookups
- [ ] 3.8 Test JWT token contains correct role information
- [ ] 3.9 Test JWT token expiration (30 days)

## 4. Migration

- [ ] 4.1 Invalidate all existing sessions (automatic with strategy change)
- [ ] 4.2 Admin user re-authenticates via magic link
- [ ] 4.3 Verify new JWT token is created correctly
- [ ] 4.4 Optional: TRUNCATE sessions table (no longer used)

## 5. Post-Deployment Validation

- [ ] 5.1 Monitor authentication success rates
- [ ] 5.2 Verify no authentication-related errors in logs
- [ ] 5.3 Test all protected routes (/admin, /creator, /read)
- [ ] 5.4 Verify session.user.role available in all components
- [ ] 5.5 Check database query reduction (no session lookups)

## 6. Documentation

- [x] 6.1 Update auth.ts comments to reflect JWT strategy
- [x] 6.2 Document session migration for future reference
- [x] 6.3 Note sessions table status (unused but kept for rollback)
