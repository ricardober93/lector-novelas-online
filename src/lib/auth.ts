import { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import EmailProvider from "next-auth/providers/email";
import { Resend } from "resend";
import { prisma } from "./prisma";
import { logger } from "./logger";
import { Role } from "@prisma/client";

const resend = new Resend(process.env.RESEND_API_KEY);

const fromEmail = "noreply@panels.lat";

const prismaAdapter = PrismaAdapter(prisma);

prismaAdapter.useVerificationToken = async ({ identifier, token }) => {
  try {
    logger.log("useVerificationToken called with:", { identifier, token });

    const verificationToken = await prisma.verificationToken.findFirst({
      where: { identifier, token },
    });

    logger.log("Token found:", verificationToken);

    if (!verificationToken) {
      logger.warn("Token not found for identifier:", identifier);
      return null;
    }

    // Check if token is expired
    if (verificationToken.expires < new Date()) {
      logger.warn("Token expired:", verificationToken.expires);
      await prisma.verificationToken.deleteMany({
        where: { identifier, token },
      });
      return null;
    }

    await prisma.verificationToken.deleteMany({
      where: { identifier, token },
    });

    logger.log("Token verified and deleted successfully");
    return verificationToken;
  } catch (error) {
    logger.error("Error in useVerificationToken:", error);
    return null;
  }
};

export const authOptions: NextAuthOptions = {
  adapter: prismaAdapter,
  providers: [
    EmailProvider({
      server: process.env.RESEND_API_KEY!,
      from: fromEmail,
      sendVerificationRequest: async ({ identifier: email, url }) => {
        console.log(url);
        try {
          await resend.emails.send({
            from: fromEmail,
            to: email,
            subject: "Ingresar a Panels",
            html: `
              <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
                <h1 style="font-size: 24px; font-weight: 600; margin-bottom: 20px;">Ingresar a Panels</h1>
                <p style="margin-bottom: 20px;">Haz click en el siguiente enlace para ingresar a tu cuenta:</p>
                <a href="${url}" style="display: inline-block; background-color: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 8px;">Ingresar a Panels</a>
                <p style="margin-top: 20px; font-size: 14px; color: #666;">Este enlace expira en 24 horas.</p>
                <p style="font-size: 14px; color: #666;">Si no solicitaste este email, puedes ignorarlo.</p>
              </div>
            `,
          });
        } catch (error) {
          logger.error("Error sending email:", error);
          throw new Error("Error sending email");
        }
      },
    }),
  ],
  callbacks: {
    /**
     * SignIn callback to ensure Account records are created during magic link authentication.
     * 
     * This fixes an issue where NextAuth's PrismaAdapter doesn't automatically create
     * Account records for email provider authentication. Without Account records, users
     * can authenticate but subsequent API calls fail with 401 errors.
     * 
     * Behavior:
     * - Checks if Account record exists for the user with provider="email"
     * - If missing, creates Account record with proper metadata
     * - Uses upsert to handle race conditions and prevent duplicates
     * - Logs all operations for monitoring and debugging
     * - Non-blocking: authentication continues even if Account creation fails
     * 
     * @see https://github.com/nextauthjs/next-auth/issues/3823
     */
    async signIn({ user, account }) {
      try {
        if (!user.email) {
          logger.warn("SignIn callback: User email is missing");
          return true;
        }

        logger.log("SignIn callback: Checking Account record for user", { 
          userId: user.id, 
          email: user.email 
        });

        const existingAccount = await prisma.account.findFirst({
          where: {
            userId: user.id,
            provider: "email",
          },
        });

        if (!existingAccount) {
          logger.log("SignIn callback: Account record not found, creating one", { 
            userId: user.id, 
            email: user.email 
          });

          await prisma.account.upsert({
            where: {
              provider_providerAccountId: {
                provider: "email",
                providerAccountId: user.email,
              },
            },
            update: {
              userId: user.id,
              type: "email",
              provider: "email",
              providerAccountId: user.email,
            },
            create: {
              userId: user.id,
              type: "email",
              provider: "email",
              providerAccountId: user.email,
            },
          });

          logger.info("SignIn callback: Account record created successfully", { 
            userId: user.id, 
            email: user.email 
          });
        } else {
          logger.log("SignIn callback: Account record already exists", { 
            userId: user.id 
          });
        }

        return true;
      } catch (error) {
        logger.error("SignIn callback: Error creating Account record", { 
          userId: user.id, 
          error 
        });
        return true;
      }
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
        });
        if (dbUser) {
          token.role = dbUser.role;
          token.showAdult = dbUser.showAdult;
        }
      }
      if (trigger === "update" && session) {
        token.name = session.name;
        token.picture = session.image;
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
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "database",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  jwt: {
    secret: process.env.NEXTAUTH_SECRET,
  },
};
