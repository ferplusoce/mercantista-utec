import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { LockKeyhole, Smartphone } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { customerEmail, isValidPhone, normalizePhone, safeReturnPath, useAuth } from "@/lib/auth";
import { Card, Field, inputCls } from "@/components/Field";

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>) => ({ redirect: typeof search.redirect === "string" ? search.redirect : undefined }),
  head: () => ({ meta: [
    { title: "Ingresa o crea tu cuenta — Mercantista" },
    { name: "description", content: "Accede con tu celular y contraseña para hacer pedidos y ver tus compras." },
    { property: "og:title", content: "Tu cuenta Mercantista" },
    { property: "og:description", content: "Tus pedidos, direcciones y taxis en un solo lugar." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
    { name: "robots", content: "noindex" },
  ] }),
  component: AuthPage,
});

function authMessage(message: string) {
  if (/invalid login credentials/i.test(message)) return "Celular o contraseña incorrectos";
  if (/already registered|already been registered/i.test(message)) return "Este celular ya tiene una cuenta. Inicia sesión.";
  if (/at least 6/i.test(message)) return "La contraseña debe tener mínimo 6 caracteres";
  return "No pudimos continuar. Revisa tus datos e inténtalo otra vez.";
}

function AuthPage() {
  const { redirect } = Route.useSearch();
  const destination = safeReturnPath(redirect);
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!loading && user) void navigate({ href: destination, replace: true });
  }, [loading, user, destination, navigate]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    if (!isValidPhone(phone)) { setError("Ingresa un celular de 9 dígitos que empiece con 9"); return; }
    if (password.length < 6) { setError("La contraseña debe tener mínimo 6 caracteres"); return; }
    setBusy(true);
    const credentials = { email: customerEmail(phone), password };
    try {
      if (mode === "register") {
        const { data, error: signUpError } = await supabase.auth.signUp({ ...credentials, options: { data: { phone: normalizePhone(phone) } } });
        if (signUpError) throw signUpError;
        if (!data.session) throw new Error("La cuenta no pudo activarse");
        toast.success("Tu cuenta está lista");
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword(credentials);
        if (signInError) throw signInError;
        toast.success("Bienvenido de vuelta");
      }
      await navigate({ href: destination, replace: true });
    } catch (cause) {
      setError(authMessage(cause instanceof Error ? cause.message : ""));
    } finally { setBusy(false); }
  };

  return (
    <div className="mx-auto max-w-md space-y-5 py-4">
      <div className="text-center">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-primary text-primary-foreground"><Smartphone className="h-7 w-7" /></span>
        <h1 className="mt-4 text-3xl font-bold">{mode === "login" ? "Ingresa a tu cuenta" : "Crea tu cuenta"}</h1>
        <p className="mt-2 text-muted-foreground">Solo necesitas tu celular y una contraseña. Sin correo ni SMS.</p>
      </div>
      <div className="grid grid-cols-2 rounded-2xl bg-muted p-1">
        <button type="button" onClick={() => { setMode("login"); setError(""); }} className={`h-11 rounded-xl text-sm font-semibold ${mode === "login" ? "bg-card shadow-sm" : ""}`}>Iniciar sesión</button>
        <button type="button" onClick={() => { setMode("register"); setError(""); }} className={`h-11 rounded-xl text-sm font-semibold ${mode === "register" ? "bg-card shadow-sm" : ""}`}>Registrarme</button>
      </div>
      <Card>
        <form onSubmit={submit} className="space-y-4">
          <Field label="Celular" required error={error && !isValidPhone(phone) ? error : undefined}>
            <input className={inputCls} inputMode="numeric" autoComplete="username" maxLength={9} placeholder="9XXXXXXXX" value={phone} onChange={(e) => setPhone(normalizePhone(e.target.value).slice(0, 9))} />
          </Field>
          <Field label="Contraseña" required error={error && isValidPhone(phone) ? error : undefined}>
            <input className={inputCls} type="password" autoComplete={mode === "login" ? "current-password" : "new-password"} minLength={6} placeholder="Mínimo 6 caracteres" value={password} onChange={(e) => setPassword(e.target.value)} />
          </Field>
          <button disabled={busy || loading} className="h-12 w-full rounded-xl bg-primary font-semibold text-primary-foreground disabled:opacity-60">
            {busy ? "Un momento..." : mode === "login" ? "Ingresar" : "Crear cuenta y entrar"}
          </button>
        </form>
      </Card>
      <p className="flex items-start gap-2 text-center text-xs text-muted-foreground"><LockKeyhole className="mx-auto h-4 w-4 shrink-0" />Tus pedidos y datos son privados. Al registrarte, tu cuenta queda activa de inmediato.</p>
      <p className="text-center text-sm"><Link to="/" className="text-primary">Volver al inicio</Link></p>
    </div>
  );
}
