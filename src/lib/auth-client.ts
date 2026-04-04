"use client";

import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields, magicLinkClient } from "better-auth/client/plugins";

import { authAdditionalFields } from "@/lib/auth-fields";

const authBaseURL =
  typeof window !== "undefined"
    ? window.location.origin
    : process.env.NEXT_PUBLIC_APP_URL ||
      process.env.NEXTAUTH_URL ||
      "http://localhost:3000";

export const authClient = createAuthClient({
  baseURL: authBaseURL,
  plugins: [magicLinkClient(), inferAdditionalFields(authAdditionalFields)],
});

export type AuthClientSession = NonNullable<typeof authClient.$Infer.Session>;
