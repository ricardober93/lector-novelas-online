## Context

The application uses NextAuth.js v4 with the PrismaAdapter for authentication via magic links (email provider). When a user clicks a magic link, NextAuth calls `useVerificationToken` to consume the token. The default PrismaAdapter implementation uses Prisma's `delete` method which throws a `PrismaClientKnownRequestError` when the token doesn't exist.

This occurs in scenarios:
1. User clicks magic link multiple times (common on mobile)
2. Network delays cause duplicate requests
3. Token expired between email send and click

Current error flow:
```
User clicks link → /api/auth/callback/email → PrismaAdapter.useVerificationToken() 
→ prisma.verificationToken.delete() → Error: "No record found for a delete"
```

## Goals / Non-Goals

**Goals:**
- Handle missing verification tokens gracefully (return null instead of throwing)
- Prevent login failures from duplicate link clicks
- Maintain security (tokens still expire and are single-use)

**Non-Goals:**
- Changing token expiration times
- Adding new authentication methods
- Modifying email templates

## Decisions

### 1. Override `useVerificationToken` in adapter
**Choice:** Extend PrismaAdapter with custom `useVerificationToken` implementation
**Rationale:** The NextAuth spec defines that `useVerificationToken` should return `null` when token not found, but PrismaAdapter's default throws. Custom implementation uses `findFirst` + `deleteMany` pattern.
**Alternatives:**
- Try-catch around delete: Works but adds exception overhead
- `deleteMany` only: Simpler but doesn't return token data needed for some flows

### 2. Remove redundant user creation in signIn callback
**Choice:** Remove the manual `prisma.user.create` in signIn callback
**Rationale:** PrismaAdapter already handles user creation. Manual creation can cause race conditions and duplicates.
**Alternatives:**
- Keep manual creation: Unnecessary code duplication

## Risks / Trade-offs

- **Risk:** Custom adapter code needs maintenance when upgrading NextAuth
  - **Mitigation:** Well-documented override with clear comments referencing NextAuth/PrismaAdapter source

- **Risk:** `findFirst` + `deleteMany` is two queries instead of one
  - **Mitigation:** Negligible performance impact; login is not a high-frequency operation
