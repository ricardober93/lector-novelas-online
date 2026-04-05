import { NextRequest, NextResponse } from "next/server";
import { toNextJsHandler } from "better-auth/next-js";

import { auth } from "@/lib/auth";
import { getRequestSession } from "@/lib/request-session";

const authHandler = toNextJsHandler(auth.handler);

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ all: string[] }> },
) {
  const { all } = await context.params;

  if (all.length === 1 && all[0] === "get-session") {
    const session = await getRequestSession(request);
    return NextResponse.json(session);
  }

  return authHandler.GET(request);
}

export const POST = authHandler.POST;
export const PATCH = authHandler.PATCH;
export const PUT = authHandler.PUT;
export const DELETE = authHandler.DELETE;
