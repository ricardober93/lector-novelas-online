import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Middleware Authentication
 * 
 * IMPORTANT: This application uses NextAuth with database session strategy (not JWT).
 * 
 * Why not use getToken()?
 * - getToken() from next-auth/jwt looks for a JWT token in cookies
 * - Database sessions store a session ID in cookies, not a JWT
 * - getToken() returns null with database sessions
 * 
 * Solution:
 * - Middleware protects UI routes only (/creator, /read, /admin)
 * - API routes protect themselves using getServerSession() in each handler
 * - This avoids duplication and works with database sessions
 * 
 * Routes protected by middleware: UI routes only
 * Routes protected by handlers: All /api/* routes (see ROUTE-AUTHENTICATION-METHODS.md)
 */
export async function middleware(request: NextRequest) {
  const sessionToken = request.cookies.get("next-auth.session-token");
  const isAuthenticated = !!sessionToken;

  const protectedPaths = ["/creator", "/read"];
  const adminPaths = ["/admin"];

  const isProtectedPath = protectedPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path),
  );

  const isAdminPath = adminPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path),
  );

  // Protect UI routes - redirect to login if not authenticated
  if (isProtectedPath && !isAuthenticated) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Protect admin routes - check authentication and role
  if (isAdminPath) {
    if (!isAuthenticated) {
      const loginUrl = new URL("/login", request.url);
      return NextResponse.redirect(loginUrl);
    }

    // Note: Role checking requires session lookup which can't be done in middleware
    // with database strategy. For admin routes, the page itself should verify role.
    // Alternatively, we could decode the session token and check a role claim if
    // we modify the JWT callback to include it.
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/creator/:path*",
    "/read/:path*",
    "/admin/:path*",
    // API routes removed - they protect themselves with getServerSession()
  ],
};
