"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { authClient } from "@/lib/auth-client";

type Mode = "login" | "register" | "forgot" | "reset";

const inputClass = "w-full rounded-md border border-zinc-300 px-3 py-2";
const buttonClass = "w-full rounded-md bg-blue-700 px-4 py-2 font-medium text-white hover:bg-blue-800 disabled:opacity-50";

export function AuthForm({ mode, token, initialError }: {
  mode: Mode;
  token?: string;
  initialError?: string;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(initialError ?? "");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    setPending(true);
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");

    try {
      if (mode === "login") {
        const result = await authClient.signIn.email({ email, password });
        if (result.error) {
          setError(result.error.status === 429 || result.error.status >= 500
            ? "Servizio non disponibile o troppi tentativi. Riprova più tardi."
            : "Accesso non riuscito. Controlla le credenziali e verifica la tua email.");
          return;
        }
        router.push("/");
        router.refresh();
      } else if (mode === "register") {
        const name = String(form.get("name") ?? "").trim();
        if (!name) {
          setError("Inserisci il tuo nome.");
          return;
        }
        const result = await authClient.signUp.email({ email, password, name, callbackURL: "/accedi" });
        if (result.error) {
          setError("Registrazione non riuscita. Controlla i dati e riprova.");
          return;
        }
        setMessage("Se è possibile completare la registrazione, riceverai un'email con le istruzioni.");
      } else if (mode === "forgot") {
        const result = await authClient.requestPasswordReset({ email, redirectTo: "/reimposta-password" });
        if (result.error) {
          setError("Richiesta non riuscita. Riprova più tardi.");
          return;
        }
        setMessage("Se esiste un account associato a questa email, riceverai le istruzioni per reimpostare la password.");
      } else {
        if (!token) {
          setError("Il link non è valido o è scaduto. Richiedine uno nuovo.");
          return;
        }
        const result = await authClient.resetPassword({ token, newPassword: password });
        if (result.error) {
          setError("Impossibile reimpostare la password. Il link potrebbe essere scaduto.");
          return;
        }
        setMessage("Password aggiornata. Ora puoi accedere.");
      }
    } catch (error) {
      console.error("Richiesta di autenticazione non riuscita:", error);
      setError("Servizio non disponibile. Riprova più tardi.");
    } finally {
      setPending(false);
    }
  }

  async function signInWithGoogle() {
    setError("");
    setPending(true);
    try {
      const result = await authClient.signIn.social({
        provider: "google",
        callbackURL: "/",
        errorCallbackURL: "/accedi?errore=google",
      });
      if (result.error) setError("Accesso con Google non disponibile. Riprova più tardi.");
    } catch (error) {
      console.error("Accesso Google non riuscito:", error);
      setError("Accesso con Google non disponibile. Riprova più tardi.");
    } finally {
      setPending(false);
    }
  }

  const titles: Record<Mode, string> = {
    login: "Accedi",
    register: "Crea un account",
    forgot: "Recupera password",
    reset: "Reimposta password",
  };

  return (
    <section className="mx-auto my-8 w-full max-w-md rounded-xl border border-zinc-200 bg-white p-6">
      <h1 className="mb-5 text-2xl font-bold">{titles[mode]}</h1>
      {error && <p role="alert" className="mb-4 rounded-md bg-red-50 p-3 text-red-700">{error}</p>}
      {message && <p role="status" className="mb-4 rounded-md bg-green-50 p-3 text-green-800">{message}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === "register" && (
          <label className="block space-y-1">
            <span>Nome</span>
            <input name="name" autoComplete="name" required maxLength={100} className={inputClass} />
          </label>
        )}
        {mode !== "reset" && (
          <label className="block space-y-1">
            <span>Email</span>
            <input name="email" type="email" autoComplete="email" required maxLength={254} className={inputClass} />
          </label>
        )}
        {mode !== "forgot" && (
          <label className="block space-y-1">
            <span>Password{mode !== "login" && " (almeno 12 caratteri)"}</span>
            <input name="password" type="password" autoComplete={mode === "login" ? "current-password" : "new-password"} required minLength={mode === "login" ? undefined : 12} maxLength={128} className={inputClass} />
          </label>
        )}
        <button type="submit" disabled={pending || (mode === "reset" && !token)} className={buttonClass}>
          {pending ? "Attendere..." : titles[mode]}
        </button>
      </form>
      {(mode === "login" || mode === "register") && (
        <button type="button" onClick={signInWithGoogle} disabled={pending} className="mt-4 w-full rounded-md border border-zinc-300 px-4 py-2 hover:bg-zinc-50 disabled:opacity-50">
          Continua con Google
        </button>
      )}
      <div className="mt-5 flex flex-col gap-2 text-sm text-blue-700">
        {mode === "login" && <Link href="/registrati">Crea un account</Link>}
        {mode === "login" && <Link href="/password-dimenticata">Hai dimenticato la password?</Link>}
        {mode !== "login" && <Link href="/accedi">Torna all&apos;accesso</Link>}
        {mode === "reset" && <Link href="/password-dimenticata">Richiedi un nuovo link</Link>}
      </div>
    </section>
  );
}
