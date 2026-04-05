import { NextRequest } from "next/server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface SessionUser {
  id: string;
  email: string;
  role: string;
  showAdult: boolean;
}

interface SessionResult {
  user: SessionUser;
}

interface LegacySessionRow {
  id: string;
  email: string;
  role: string;
  showAdult: boolean;
}

function getLegacySessionToken(request: NextRequest): string | null {
  const cookieNames = [
    "better-auth.session_token",
    "__Secure-better-auth.session_token",
  ];

  for (const cookieName of cookieNames) {
    const value = request.cookies.get(cookieName)?.value;

    if (typeof value === "string" && value.length > 0) {
      return value;
    }
  }

  return null;
}

async function getLegacySession(
  request: NextRequest,
): Promise<SessionResult | null> {
  const sessionToken = getLegacySessionToken(request);

  if (!sessionToken) {
    return null;
  }

  const rows = await prisma.$queryRaw<LegacySessionRow[]>`
    select
      u.id,
      u.email,
      u.role::text as role,
      coalesce(u."showAdult", false) as "showAdult"
    from sessions s
    inner join users u on u.id = s."userId"
    where s."sessionToken" = ${sessionToken}
      and s.expires > now()
    limit 1
  `;

  const user = rows[0];

  if (!user) {
    return null;
  }

  return {
    user,
  };
}

export async function getRequestSession(
  request: NextRequest,
): Promise<SessionResult | null> {
  const session = await auth.api.getSession({ headers: request.headers });

  if (session?.user) {
    return {
      user: {
        id: session.user.id,
        email: session.user.email,
        role: session.user.role,
        showAdult: session.user.showAdult ?? false,
      },
    };
  }

  return getLegacySession(request);
}
