import { AuthForm } from "@/components/auth-form";

export default async function ResetPasswordPage({ searchParams }: PageProps<"/reimposta-password">) {
  const params = await searchParams;
  const token = typeof params.token === "string" ? params.token : undefined;
  return <AuthForm mode="reset" token={token} initialError={!token ? "Il link non è valido o è scaduto. Richiedine uno nuovo." : undefined} />;
}
