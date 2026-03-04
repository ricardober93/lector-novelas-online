## 1. Core Implementation

- [x] 1.1 Add signIn callback to NextAuth configuration in src/lib/auth.ts
- [x] 1.2 Implement Account record creation logic in signIn callback
- [x] 1.3 Add upsert logic to handle race conditions and duplicate Accounts
- [x] 1.4 Add error handling and logging for Account creation failures
- [ ] 1.5 Verify Account creation doesn't break existing authentication flows

## 2. Migration Script

- [x] 2.1 Create migration script file (scripts/migrate-missing-accounts.sql or .ts)
- [x] 2.2 Implement SQL query to create missing Account records
- [x] 2.3 Add idempotency check to prevent duplicate Account creation
- [x] 2.4 Add verification query to count affected rows
- [ ] 2.5 Test migration script in development environment

## 3. Logging and Monitoring

- [x] 3.1 Add logger statements for Account creation attempts
- [x] 3.2 Add warning logs when Account creation fails
- [x] 3.3 Add info logs for successful Account creation
- [x] 3.4 Verify logs are properly formatted and include relevant context

## 4. Testing

- [ ] 4.1 Test new user authentication with magic link - verify Account created
- [ ] 4.2 Test existing user authentication - verify Account created if missing
- [ ] 4.3 Test user with existing Account - verify no duplicate created
- [ ] 4.4 Test all authenticated API endpoints return 200 instead of 401
- [ ] 4.5 Test migration script on staging database
- [ ] 4.6 Verify migration script is idempotent (run twice, no duplicates)

## 5. Documentation

- [x] 5.1 Document the Account creation behavior in code comments
- [x] 5.2 Document migration script usage and execution steps
- [x] 5.3 Update any relevant authentication flow documentation

## 6. Deployment

- [ ] 6.1 Deploy code changes to staging environment
- [ ] 6.2 Run migration script on staging database
- [ ] 6.3 Verify staging authentication works end-to-end
- [ ] 6.4 Monitor staging logs for Account creation issues
- [ ] 6.5 Deploy code changes to production
- [ ] 6.6 Run migration script on production database during low-traffic period
- [ ] 6.7 Monitor production logs for authentication errors
- [ ] 6.8 Verify 401 error rates decrease in production

## 7. Verification

- [ ] 7.1 Query database to confirm all users have Account records
- [ ] 7.2 Test magic link authentication with new test user
- [ ] 7.3 Verify all API endpoints work for authenticated users
- [ ] 7.4 Check authentication success rates in production monitoring
