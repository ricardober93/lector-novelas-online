# Middleware Authentication Documentation

## Overview

This document explains the middleware authentication approach and the separation between UI and API route protection.

## Architecture

### Session Strategy: Database (Not JWT)

**Important:** This application uses NextAuth v4 with **database session strategy**, not JWT strategy.

```
┌────────────────────────────────────────────────────────┐
│          Database Session Strategy                      │
├────────────────────────────────────────────────────────┤
│                                                        │
│  Authentication Flow:                                  │
│  1. User authenticates via magic link                  │
│  2. Session record created in database                 │
│  3. Session cookie set: next-auth.session-token        │
│  4. Cookie contains: session ID (not JWT)              │
│                                                        │
│  Why NOT JWT Strategy:                                 │
│  - Database sessions allow immediate revocation        │
│  - Better security for admin operations                │
│  - Session management via database                     │
│  - Can track all active sessions                       │
│                                                        │
└────────────────────────────────────────────────────────┘
```

### Why getToken() Doesn't Work

```
┌────────────────────────────────────────────────────────┐
│           getToken() Incompatibility                    │
├────────────────────────────────────────────────────────┤
│                                                        │
│  getToken() from next-auth/jwt:                        │
│  - Expects: JWT token in cookie                        │
│  - Reality: Session ID in cookie                       │
│  - Result: Returns null                                │
│                                                        │
│  Database Session Cookie:                              │
│  ┌────────────────────────────────────────┐           │
│  │ next-auth.session-token = "sess_abc123"│           │
│  └────────────────────────────────────────┘           │
│             ↓                                          │
│     getToken() tries to decode as JWT                  │
│             ↓                                          │
│        Returns NULL ❌                                 │
│                                                        │
└────────────────────────────────────────────────────────┘
```

## Route Protection Strategy

### UI Routes: Protected by Middleware

Middleware protects UI routes by checking for session cookie existence.

| Route | Protection | Behavior |
|-------|-----------|----------|
| `/creator/*` | Middleware | Redirect to /login if no session |
| `/read/*` | Middleware | Redirect to /login if no session |
| `/admin/*` | Middleware + Page | Middleware checks session, page checks role |

**Why middleware for UI routes?**
- Fast (no database lookup)
- Prevents page flash before redirect
- Better user experience

### API Routes: Protected by Handlers

Each API route handler uses `getServerSession()` to verify authentication.

| Route | Protection | Behavior |
|-------|-----------|----------|
| `/api/series/*` | getServerSession() | Returns 401 if no session |
| `/api/chapters/*` | getServerSession() | Returns 401 if no session |
| `/api/user/*` | getServerSession() | Returns 401 if no session |
| `/api/admin/*` | getServerSession() + Role | Returns 401 if no session or not ADMIN |

**Why handlers for API routes?**
- `getServerSession()` works correctly with database sessions
- Can access full session data (user, role, etc.)
- Already implemented in all protected routes
- No duplication needed

## Implementation Details

### Middleware Implementation

```typescript
export async function middleware(request: NextRequest) {
  // Check for session cookie (not JWT token)
  const sessionToken = request.cookies.get("next-auth.session-token");
  const isAuthenticated = !!sessionToken;

  // Protect UI routes
  if (isProtectedPath && !isAuthenticated) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/creator/:path*",
    "/read/:path*",
    "/admin/:path*",
    // API routes NOT included - they self-protect
  ],
};
```

### API Handler Implementation

```typescript
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  
  // Proceed with authenticated request
  // ...
}
```

## Security Considerations

### Is This Secure?

**Yes, for the following reasons:**

1. **Same authentication mechanism**: Both middleware and API handlers use the same session cookies and database sessions
2. **Defense in depth**: Critical operations should still verify permissions in handlers
3. **No bypass possible**: All protected routes require authentication
4. **Admin routes**: Role checking happens in page components and API handlers

### What About Admin Role Checking?

**Current limitation:** Middleware cannot check user roles with database sessions because:
- Middleware runs in Edge Runtime
- Prisma (database access) doesn't work in Edge Runtime
- Session lookup requires database query

**Solution:** Admin pages and API handlers verify role themselves:
- UI: Admin page component checks `session.user.role`
- API: Admin API handlers check `session.user.role`

## Migration from getToken()

### Before (Broken)

```typescript
import { getToken } from "next-auth/jwt";

const token = await getToken({ req: request });
// Returns null with database sessions ❌
```

### After (Working)

```typescript
const sessionToken = request.cookies.get("next-auth.session-token");
const isAuthenticated = !!sessionToken;
// Works with database sessions ✅
```

## Future Considerations

### Potential Improvements

1. **Redis-based session cache**: Could enable middleware to check roles
2. **JWT + Database hybrid**: Could use JWT for middleware, database for revocation
3. **Custom Edge-compatible session store**: Would allow database lookups in middleware

### Current Trade-offs

| Aspect | Current Approach | Alternative | Why Current |
|--------|-----------------|-------------|-------------|
| Role checking | In handlers | In middleware | Simpler, no infrastructure |
| Session lookup | Database | Redis cache | No additional infrastructure |
| Performance | Good | Slightly better | Not a bottleneck |
| Complexity | Low | Higher | Simplicity wins |

## Troubleshooting

### Middleware returns redirect when user is authenticated

**Check:**
1. Session cookie exists: `document.cookie` in browser
2. Cookie name is correct: `next-auth.session-token`
3. Cookie domain matches

### API returns 401 when user is authenticated

**Check:**
1. Session exists in database: `SELECT * FROM sessions WHERE "sessionToken" = 'xxx'`
2. Session not expired: Check `expires` column
3. User exists: `SELECT * FROM users WHERE id = 'xxx'`

### Admin routes accessible to non-admin users

**Check:**
1. Page component verifies role
2. API handler verifies role
3. Session includes role: Check `session.user.role` in handler

## References

- [NextAuth Database Sessions](https://next-auth.js.org/configuration/options#session)
- [NextAuth Middleware](https://next-auth.js.org/configuration/nextjs#middleware)
- [Edge Runtime Limitations](https://nextjs.org/docs/app/api-reference/edge-runtime)
