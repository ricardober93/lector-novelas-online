## Why

Middleware uses `getToken()` from next-auth/jwt which returns null with database session strategy. This blocks authenticated users from accessing protected routes because the cookie contains a session ID (not a JWT token) that `getToken()` cannot decode.

## What Changes

- Remove API routes from middleware matcher configuration
- Keep middleware protection only for UI routes (/creator, /read, /admin)
- API routes continue to protect themselves using `getServerSession()` in each handler
- No changes to authentication strategy or session management

## Capabilities

### New Capabilities

None - this is a fix to existing middleware behavior.

### Modified Capabilities

None - no spec-level requirements are changing. API routes already implement their own authentication via `getServerSession()`.

## Impact

- **Middleware**: Will only protect UI routes, not API routes
- **API Routes**: Continue to work as-is (already use `getServerSession`)
- **Security**: No security impact - same authentication checks occur, just in different locations
- **Performance**: Slight improvement - middleware no longer processes API requests
- **Code**: Changes only in `src/middleware.ts` config matcher array
