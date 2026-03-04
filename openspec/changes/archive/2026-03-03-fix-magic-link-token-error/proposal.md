## Why

The magic link authentication fails with a Prisma error when the verification token doesn't exist during the callback flow. This happens because NextAuth's PrismaAdapter uses a `delete` operation to consume tokens, which throws an error if the token was already used or doesn't exist. Users clicking the magic link multiple times or experiencing network delays get a failed login.

## What Changes

- Override the `useVerificationToken` method in the PrismaAdapter to handle missing tokens gracefully
- Return `null` instead of throwing when token doesn't exist (expected behavior per NextAuth spec)
- Remove duplicate user creation in `signIn` callback (PrismaAdapter handles this automatically)

## Capabilities

### New Capabilities
- `magic-link-auth`: Robust magic link authentication that handles token consumption edge cases

### Modified Capabilities
- None (this is a bug fix, not a requirement change)

## Impact

- `src/lib/auth.ts` - Adapter configuration and callback modifications
- Authentication flow - More resilient to duplicate link clicks and race conditions
