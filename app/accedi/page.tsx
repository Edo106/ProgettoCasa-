import { AuthForm } from "@/components/auth-form";

export default async function LoginPage({ searchParams }: PageProps<"/accedi">) {
  const params = await searchParams;
  return <AuthForm mode="login" initialError={params.errore ? "Accesso con Google non riuscito. Riprova." : undefined} />;
}
