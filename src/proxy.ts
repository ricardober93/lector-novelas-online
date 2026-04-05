import { NextResponse, type NextRequest } from "next/server";

function hasSessionCookie(request: NextRequest): boolean {
  const sessionCookieNames = [
    "better-auth.session_token",
    "__Secure-better-auth.session_token",
  ];

  return sessionCookieNames.some((cookieName) => {
    const value = request.cookies.get(cookieName)?.value;
    return typeof value === "string" && value.length > 0;
  });
}

export function proxy(request: NextRequest) {
  const isProtectedPath = ["/creator", "/read", "/admin"].some((path) =>
    request.nextUrl.pathname.startsWith(path),
  );

  if (!isProtectedPath) {
    return NextResponse.next();
  }

  if (!hasSessionCookie(request)) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/creator/:path*", "/read/:path*", "/admin/:path*"],
};
