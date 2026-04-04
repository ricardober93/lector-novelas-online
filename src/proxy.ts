import { NextResponse, type NextRequest } from "next/server";

import { getSessionCookie } from "better-auth/cookies";

export function proxy(request: NextRequest) {
  const isProtectedPath = ["/creator", "/read", "/admin"].some((path) =>
    request.nextUrl.pathname.startsWith(path),
  );

  if (!isProtectedPath) {
    return NextResponse.next();
  }

  const sessionCookie = getSessionCookie(request);

  if (!sessionCookie) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/creator/:path*", "/read/:path*", "/admin/:path*"],
};
