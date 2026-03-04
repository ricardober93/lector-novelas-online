## 1. Fix PrismaAdapter token handling

- [x] 1.1 Create custom `useVerificationToken` function using `findFirst` + `deleteMany` pattern
- [x] 1.2 Override PrismaAdapter's `useVerificationToken` with custom implementation in auth.ts

## 2. Clean up signIn callback

- [x] 1.3 Remove manual user creation from signIn callback (PrismaAdapter handles this)

## 3. Verification

- [x] 1.4 Test magic link login with fresh token
- [x] 1.5 Test magic link login with already-used token (duplicate click)
- [x] 1.6 Test magic link login with expired token
