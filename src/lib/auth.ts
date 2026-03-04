import { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import EmailProvider from "next-auth/providers/email";
import { Resend } from "resend";
import { prisma } from "./prisma";
import { logger } from "./logger";

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
    async session({ session, user }) {
      if (session.user && user) {
        session.user.id = user.id;
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
        });
        if (dbUser) {
          session.user.role = dbUser.role;
          session.user.showAdult = dbUser.showAdult;
        }
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
};
