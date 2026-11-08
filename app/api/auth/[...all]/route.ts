import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "@/lib/auth";

const handler = toNextJsHandler(auth);

export const GET = handler.GET;

export async function POST(request: Request) {
  const path = new URL(request.url).pathname.replace(/\/+$/, "");
  const requiresEmail = [
    "/api/auth/sign-up/email",
    "/api/auth/request-password-reset",
    "/api/auth/send-verification-email",
  ].includes(path);

  if (requiresEmail && (!process.env.RESEND_API_KEY || !process.env.AUTH_EMAIL_FROM)) {
    console.error("Autenticazione non disponibile: configurazione email mancante.");
    return Response.json({ error: "Servizio email non configurato." }, { status: 503 });
  }

  return handler.POST(request);
}
