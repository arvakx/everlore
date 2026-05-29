import { useState, type FormEvent } from "react";
import { Link, useRouter } from "@tanstack/react-router";
import { setUser, getUser } from "@/lib/store";
import { LumiAvatar } from "@/components/LumiAvatar";
import { Particles } from "@/components/Particles";

interface Props { mode: "login" | "signup"; }

export function AuthCard({ mode }: Props) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const isSignup = mode === "signup";

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (!email || !password || (isSignup && !name)) {
      setError("Completa todos los campos.");
      return;
    }
    const existing = getUser();
    setUser({
      name: isSignup ? name : "Gabriel Calderón",
      email,
      plan: existing?.plan ?? "free",
      proactiveNudges: existing?.proactiveNudges ?? true,
      fontSize: existing?.fontSize ?? 19,
      theme: existing?.theme ?? "noche",
      xp: existing?.xp ?? 0,
      immersionTheme: existing?.immersionTheme ?? "ninguno",
      specialist: existing?.specialist ?? "lumi",
    });
    router.navigate({ to: "/" });
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-aurora px-4 overflow-hidden">
      <Particles count={22} />
      <div className="w-full max-w-md animate-fade-up relative z-10">
        <div className="mb-10 text-center">
          <div className="flex justify-center mb-4">
            <LumiAvatar size={72} state="mystic" />
          </div>
          <div className="font-serif text-5xl tracking-tight gradient-text text-glow">Everlore</div>
          <p className="mt-3 text-sm text-ink-muted italic">
            Tu santuario creativo. Lumi te está esperando.
          </p>
        </div>

        <div className="rounded-3xl glass-strong p-8 shadow-paper glow-border">
          <h1 className="font-serif text-2xl text-ink mb-1">
            {isSignup ? "Forja tu cuenta" : "Vuelve a tu historia"}
          </h1>
          <p className="text-xs text-ink-muted mb-6">
            {isSignup ? "Cruza el umbral de Everlore." : "Lumi recuerda dónde lo dejaste."}
          </p>

          <form onSubmit={onSubmit} className="space-y-4">
            {isSignup && (
              <Field label="Nombre">
                <input value={name} onChange={(e) => setName(e.target.value)} className={inputCls} placeholder="Tu nombre" />
              </Field>
            )}
            <Field label="Correo electrónico">
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} placeholder="tu@correo.com" />
            </Field>
            <Field label="Contraseña">
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className={inputCls} placeholder="••••••••" />
            </Field>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <button
              type="submit"
              className="w-full rounded-xl gradient-emerald px-4 py-3 text-sm font-medium text-primary-foreground transition-all hover:shadow-glow active:scale-[0.98]"
            >
              {isSignup ? "Encender mi historia" : "Entrar a Everlore"}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-ink-muted">
            {isSignup ? (
              <Link to="/login" className="text-mint hover:text-neon transition-colors">
                Ya tengo cuenta · Iniciar sesión
              </Link>
            ) : (
              <>
                <Link to="/signup" className="text-mint hover:text-neon transition-colors">
                  ¿Aún no estás aquí? · Crear cuenta
                </Link>
                <div className="mt-2">
                  <button
                    type="button"
                    onClick={() => setError("Te enviaríamos un correo para restablecerla.")}
                    className="text-ink-muted hover:text-mint text-xs"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        <p className="mt-6 text-center text-[11px] text-ink-muted/70 italic">
          “Las historias no se escriben solas. Se acompañan.”
        </p>
      </div>
    </div>
  );
}

const inputCls =
  "w-full rounded-xl border border-hairline bg-paper/60 px-4 py-3 text-sm text-ink placeholder:text-ink-muted/60 outline-none focus:border-emerald focus:ring-2 focus:ring-emerald/30 transition";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] uppercase tracking-[0.15em] text-ink-muted">{label}</span>
      {children}
    </label>
  );
}
