# Investigation Plan: Middleware getToken() Returns Null

## Problem Statement

The middleware uses `getToken()` from `next-auth/jwt` but it returns `null`, preventing authenticated users from accessing protected routes.

## Current Architecture

```
src/lib/auth.ts
├─ Session Strategy: "database" (line 194)
├─ JWT Secret: Defined (line 197-199)
├─ JWT Callback: Populates token with user data (lines 163-179)
└─ Session Callback: Reads from token (lines 180-187)

src/middleware.ts
└─ getToken({ req: request }) → Returns null ❌
```

## Root Cause Analysis

### Why getToken() Returns Null

**NextAuth v4 behavior with database sessions:**

```
┌─────────────────────────────────────────────────────────────┐
│                Session Strategy Comparison                   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  JWT Strategy:                                              │
│  ┌────────────┐                                            │
│  │   Cookie   │ next-auth.session-token = JWT payload      │
│  │   getToken │ ✅ Can decode JWT from cookie              │
│  │   Storage  │ No database lookup needed                  │
│  └────────────┘                                            │
│                                                             │
│  Database Strategy:                                         │
│  ┌────────────┐                                            │
│  │   Cookie   │ next-auth.session-token = Session ID       │
│  │   getToken │ ❌ No JWT in cookie to decode              │
│  │   Storage  │ Session data in database                   │
│  └────────────┘                                            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Key Insight:** Even though JWT callbacks are defined, NextAuth doesn't store the JWT in a cookie when using database strategy. The callbacks are used internally to populate the session object during server-side rendering.

## Investigation Steps

### Step 1: Verify Cookie Contents

**Goal:** Confirm what cookies are actually being set

**Action:** Add temporary logging to middleware

```typescript
// In src/middleware.ts
export async function middleware(request: NextRequest) {
  console.log("=== Cookie Debug ===");
  console.log("All cookies:", request.cookies.getAll());
  
  const sessionCookie = request.cookies.get("next-auth.session-token");
  console.log("Session cookie value:", sessionCookie?.value);
  
  const token = await getToken({ req: request });
  console.log("getToken result:", token);
  
  // ... rest of middleware
}
```

**Expected Output:**
- Session cookie exists (contains session ID)
- getToken returns null (no JWT to decode)

### Step 2: Check Database Session Table

**Goal:** Verify sessions are being created in database

**Action:** Query the sessions table

```sql
SELECT * FROM sessions ORDER BY "expires" DESC LIMIT 5;
```

**Expected:** Active session records exist

### Step 3: Test API Routes with getServerSession

**Goal:** Confirm database sessions work correctly

**Action:** Hit an API endpoint that uses `getServerSession`

```bash
curl -H "Cookie: next-auth.session-token=<session-id>" \
  http://localhost:3000/api/user
```

**Expected:** Returns user data (proves database sessions work)

### Step 4: Understand NextAuth's Dual Strategy

**Research Question:** Can we use BOTH database sessions AND JWT tokens?

**Documentation to check:**
- NextAuth v4 docs on "Database + JWT" hybrid
- Edge Runtime compatibility for middleware

## Solution Options

### Option 1: Switch to JWT Strategy (Not Recommended)

**Pros:**
- getToken() works in middleware
- No database lookup overhead

**Cons:**
- ❌ Design explicitly says "Non-Goal: No cambiar la estrategia de sesión"
- Loses database session benefits (revocation, multi-device management)

### Option 2: Use Edge-Compatible Session Lookup (Recommended)

**Approach:** Create custom session lookup for middleware

**Implementation:**
```typescript
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "./src/lib/prisma";

export async function middleware(request: NextRequest) {
  const sessionToken = request.cookies.get("next-auth.session-token");
  
  if (!sessionToken) {
    // No session cookie, not authenticated
    return handleUnauthenticated(request);
  }
  
  // Look up session in database
  const session = await prisma.session.findUnique({
    where: { sessionToken: sessionToken.value },
    include: { user: true },
  });
  
  if (!session || session.expires < new Date()) {
    // Invalid or expired session
    return handleUnauthenticated(request);
  }
  
  // Session valid, check roles if needed
  if (isAdminPath && session.user.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/", request.url));
  }
  
  return NextResponse.next();
}
```

**Challenge:** Prisma doesn't work in Edge Runtime (middleware default)

**Solutions:**
1. Use `runtime: 'nodejs'` in middleware config (loses edge benefits)
2. Use REST API to check session (adds latency)
3. Use Redis/cache for session lookup (adds infrastructure)

### Option 3: Hybrid Strategy with JWT for Middleware

**Approach:** Keep database sessions but also generate JWT for middleware

**Implementation:**

```typescript
// In src/lib/auth.ts callbacks
callbacks: {
  async jwt({ token, user, trigger, session }) {
    if (user) {
      token.id = user.id;
      token.role = user.role;
      token.showAdult = user.showAdult;
    }
    return token;
  },
  
  async session({ session, token }) {
    if (session.user && token) {
      session.user.id = token.id as string;
      session.user.role = token.role as Role;
      session.user.showAdult = token.showAdult as boolean;
    }
    return session;
  },
  
  // NEW: Create JWT even with database strategy
  async signIn({ user, account }) {
    // ... existing account creation logic
    return true;
  },
},

// CHANGE: Switch to JWT strategy but keep database adapter
session: {
  strategy: "jwt", // Changed from "database"
  maxAge: 30 * 24 * 60 * 60,
},

// KEEP: Database adapter for user management
adapter: prismaAdapter,
```

**How it works:**
- JWT stored in cookie (getToken works)
- User/session data still managed via Prisma adapter
- Session callback populates from JWT token
- Best of both worlds

**Trade-offs:**
- ✅ getToken() works in middleware
- ✅ Database adapter still manages users
- ❌ Sessions not in database (can't revoke immediately)
- ❌ Changes session strategy (but keeps adapter benefits)

### Option 4: Middleware Bypass for API Routes

**Approach:** Remove middleware protection for API routes, rely on `getServerSession` in each route

**Implementation:**
```typescript
// In middleware.ts
export const config = {
  matcher: [
    "/creator/:path*",  // Keep UI route protection
    "/read/:path*",     // Keep UI route protection
    "/admin/:path*",    // Keep UI route protection
    // Remove /api/* routes from middleware
  ],
};

// API routes already check getServerSession individually
```

**Pros:**
- Simple change
- No strategy changes
- API routes already protected

**Cons:**
- Middleware doesn't protect API routes
- Each API route must check session (already doing this)

## Recommended Investigation Flow

```
┌─────────────────────────────────────────────────────────┐
│                Investigation Steps                       │
└─────────────────────────────────────────────────────────┘

1. Add cookie logging to middleware
   └─> Confirm session cookie exists
   └─> Confirm no JWT cookie

2. Query database sessions table
   └─> Verify sessions are being created
   └─> Check session expiration

3. Test API route authentication
   └─> Confirm getServerSession works
   └─> Proves database sessions functional

4. Decide on solution:
   ├─> Option 2: Edge-compatible lookup (complex)
   ├─> Option 3: Hybrid JWT strategy (recommended)
   └─> Option 4: Remove API from middleware (simplest)

5. Implement chosen solution
   └─> Update design.md with decision
   └─> Create tasks for implementation
```

## Quick Win: Option 4 Implementation

**Fastest fix with minimal changes:**

```typescript
// src/middleware.ts - Updated config
export const config = {
  matcher: [
    "/creator/:path*",
    "/read/:path*", 
    "/admin/:path*",
    // Removed: "/api/series/:path*",
    // Removed: "/api/chapters/:path*",
    // Removed: "/api/user/:path*",
    // Removed: "/api/admin/:path*",
  ],
};
```

**Why this works:**
- UI routes (creator, read, admin) still protected by middleware
- API routes already use `getServerSession` in each handler
- No changes to auth strategy
- No edge runtime issues

**Verification:**
```bash
# Test that API routes still protected
curl http://localhost:3000/api/user
# Should return 401 (from getServerSession in route handler)

# Test that UI routes protected
curl http://localhost:3000/creator
# Should redirect to /login (from middleware)
```

## Questions to Answer

1. **Performance:** Is middleware protection needed for API routes, or is per-route `getServerSession` sufficient?
2. **Security:** Does removing API routes from middleware create any security gaps?
3. **User Experience:** Should middleware handle both UI and API, or is separation acceptable?
4. **Future:** Will we need middleware-based rate limiting or other features that require API route interception?

## Next Steps

1. Run investigation steps 1-3 to confirm hypothesis
2. Discuss solution options with team
3. Choose solution (recommend Option 4 for quick fix, Option 3 for long-term)
4. Update design.md with chosen approach
5. Create implementation tasks
