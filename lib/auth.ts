import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { after } from "next/server";
import { Resend } from "resend";
import { prisma } from "@/lib/prisma";

async function sendAuthEmail(to: string, subject: string, message: string, url: string) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.AUTH_EMAIL_FROM;
  if (!apiKey || !from) {
    throw new Error("RESEND_API_KEY e AUTH_EMAIL_FROM sono necessari per inviare email.");
  }

  const { error } = await new Resend(apiKey).emails.send({
    from,
    to,
    subject,
    text: `${message}\n\n${url}\n\nSe non hai richiesto questa operazione, ignora questa email.`,
  });
  if (error) {
    throw new Error(`Invio email non riuscito: ${error.message}`);
  }
}

const googleId = process.env.GOOGLE_CLIENT_ID;
const googleSecret = process.env.GOOGLE_CLIENT_SECRET;

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    minPasswordLength: 12,
    revokeSessionsOnPasswordReset: true,
    sendResetPassword: async ({ user, url }) => {
      await sendAuthEmail(user.email, "Reimposta la password", "Apri questo link per scegliere una nuova password:", url);
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    sendVerificationEmail: async ({ user, url }) => {
      await sendAuthEmail(user.email, "Verifica la tua email", "Apri questo link per verificare la tua email:", url);
    },
  },
  socialProviders: googleId && googleSecret
    ? { google: { clientId: googleId, clientSecret: googleSecret, requireEmailVerification: true } }
    : {},
  rateLimit: {
    enabled: true,
    storage: "database",
    window: 60,
    max: 100,
    customRules: {
      "/sign-in/email": { window: 60, max: 5 },
      "/sign-up/email": { window: 60, max: 5 },
      "/request-password-reset": { window: 60, max: 3 },
      "/send-verification-email": { window: 60, max: 3 },
    },
  },
  advanced: {
    ipAddress: {
      ipAddressHeaders: process.env.VERCEL ? ["x-vercel-forwarded-for"] : [],
    },
    backgroundTasks: {
      handler: (task) => {
        after(async () => {
          try {
            await task;
          } catch (error) {
            console.error("Operazione di autenticazione in background non riuscita:", error);
          }
        });
      },
    },
  },
});
