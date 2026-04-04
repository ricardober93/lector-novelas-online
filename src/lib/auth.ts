import { betterAuth } from "better-auth";
import { createAuthMiddleware } from "better-auth/api";
import { prismaAdapter } from "@better-auth/prisma-adapter";
import { magicLink } from "better-auth/plugins";
import { Resend } from "resend";

import { isAdminEmail, normalizeEmail } from "./admin-user";
import { authDatabaseConfig } from "./auth-config";
import { authAdditionalFields } from "./auth-fields";
import { prisma } from "./prisma";
import { logger } from "./logger";

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    return null;
  }

  return new Resend(apiKey);
}

const authBaseURL = process.env.BETTER_AUTH_URL || "http://localhost:3000";

const authSecret =
  process.env.BETTER_AUTH_SECRET || "dev-only-better-auth-secret-change-me";

const fromEmail = "noreply@panels.lat";

export const auth = betterAuth({
  baseURL: authBaseURL,
  secret: authSecret,
  database: prismaAdapter(prisma, authDatabaseConfig),
  user: {
    additionalFields: authAdditionalFields.user,
  },
  session: {
    expiresIn: 30 * 24 * 60 * 60,
    updateAge: 24 * 60 * 60,
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,
    },
  },
  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      if (ctx.path !== "/sign-in/email") {
        return;
      }

      const email = typeof ctx.body?.email === "string" ? normalizeEmail(ctx.body.email) : "";

      if (!isAdminEmail(email)) {
        return;
      }

      await prisma.user.upsert({
        where: { email },
        update: {
          role: "ADMIN",
          emailVerified: true,
        },
        create: {
          email,
          role: "ADMIN",
          emailVerified: true,
          showAdult: false,
        },
      });
    }),
  },
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          if (!isAdminEmail(user.email)) {
            return;
          }

          await prisma.user.update({
            where: { email: normalizeEmail(user.email) },
            data: {
              role: "ADMIN",
              emailVerified: true,
            },
          });
        },
      },
    },
  },
  plugins: [
    magicLink({
      sendMagicLink: async ({ email, url }) => {
        try {
          const resend = getResendClient();

          if (!resend) {
            throw new Error("RESEND_API_KEY no configurada");
          }

          await resend.emails.send({
            from: fromEmail,
            to: email,
            subject: "Ingresar a Panels",
            html: `
              <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
                <h1 style="font-size: 24px; font-weight: 600; margin-bottom: 20px;">Ingresar a Panels</h1>
                <p style="margin-bottom: 20px;">Haz click en el siguiente enlace para ingresar a tu cuenta:</p>
                <a href="${url}" style="display: inline-block; background-color: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 8px;">Ingresar a Panels</a>
                <p style="margin-top: 20px; font-size: 14px; color: #666;">Este enlace expira en 5 minutos.</p>
                <p style="font-size: 14px; color: #666;">Si no solicitaste este email, puedes ignorarlo.</p>
              </div>
            `,
          });
        } catch (error) {
          logger.error("Error sending magic link email:", error);
          throw new Error("Error al enviar el email");
        }
      },
    }),
  ],
});

export type AuthSession = NonNullable<
  Awaited<ReturnType<typeof auth.api.getSession>>
>;
