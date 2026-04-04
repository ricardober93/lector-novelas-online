## 1. Research and Schema Alignment

- [x] 1.1 Review the current auth tables, session claims, and protected route assumptions
- [x] 1.2 Confirm the Better Auth Prisma schema and migration path for the existing PostgreSQL database
- [x] 1.3 Decide whether to map the current auth tables or create a fresh Better Auth schema

## 2. Core Auth Migration

- [x] 2.1 Replace the NextAuth configuration with Better Auth configuration
- [x] 2.2 Add Better Auth magic-link support using the existing email delivery provider
- [x] 2.3 Add session customization so `id`, `role`, and `showAdult` remain available
- [x] 2.4 Replace the NextAuth API route handler with the Better Auth handler
- [x] 2.5 Add or replace the client auth helper for sign-in and session access

## 3. App Integration

- [x] 3.1 Update the login page to use Better Auth client sign-in
- [x] 3.2 Update shared auth typings and session consumers across the app
- [x] 3.3 Update route protection for creator, reader, and admin access
- [x] 3.4 Update any components that still assume NextAuth-specific session shapes

## 4. Database Migration

- [ ] 4.1 Generate or apply the Better Auth auth schema against PostgreSQL
- [ ] 4.2 Migrate existing user data and preserve Panels-specific fields
- [ ] 4.3 Define the cutover plan for invalidating old NextAuth sessions
- [ ] 4.4 Verify the migration is safe to run in staging before production

## 5. Validation and Rollout

- [ ] 5.1 Test magic-link login end to end with a new user
- [ ] 5.2 Test existing user login after the migration cutover
- [ ] 5.3 Verify creator and admin route access with the new session model
- [ ] 5.4 Verify unauthenticated users are redirected to login
- [x] 5.5 Run `npm run build` and confirm the app compiles cleanly
- [ ] 5.6 Document the rollout and rollback plan for the team
