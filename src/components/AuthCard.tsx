import { useState, type FormEvent } from "react";
import { Link, useRouter } from "@tanstack/react-router";
import { setUser, getUser } from "@/lib/store";

interface Props {
  mode: "login" | "signup";
}

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
      theme: existing?.theme ?? "light",
    });
    router.navigate({ to: "/" });
  }
      plan: existing?.plan ?? "free",
      proactiveNudges: existing?.proactiveNudges ?? true,
      fontSize: existing?.fontSize ?? 19,
      theme: existing?.theme ?? "light",
    });
    router.navigate({ to: "/" });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="font-serif text-3xl font-semibold text-ink">Writedy</div>
          <p className="mt-2 text-sm text-ink-muted italic">
            Tu espacio para escribir, acompañado.
          </p>
        </div>

        <div className="rounded-2xl border border-hairline bg-paper-elevated p-7 shadow-paper">
          <h1 className="font-serif text-xl text-ink mb-5">
            {isSignup ? "Crear cuenta" : "Iniciar sesión"}
          </h1>

          <form onSubmit={onSubmit} className="space-y-4">
            {isSignup && (
              <Field label="Nombre">
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={inputCls}
                  placeholder="Tu nombre"
                />
              </Field>
            )}
            <Field label="Correo electrónico">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputCls}
                placeholder="tu@correo.com"
              />
            </Field>
            <Field label="Contraseña">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputCls}
                placeholder="••••••••"
              />
            </Field>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <button
              type="submit"
              className="w-full rounded-lg bg-ember px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-ember-hover"
            >
              {isSignup ? "Crear mi cuenta" : "Entrar"}
            </button>
          </form>

          <div className="mt-5 text-center text-sm text-ink-muted">
            {isSignup ? (
              <Link to="/login" className="text-ember hover:text-ember-hover">
                Ya tengo cuenta. Iniciar sesión
              </Link>
            ) : (
              <>
                <Link to="/signup" className="text-ember hover:text-ember-hover">
                  ¿No tienes cuenta? Regístrate
                </Link>
                <div className="mt-2">
                  <button
                    type="button"
                    onClick={() => setError("Te enviaríamos un correo para restablecerla.")}
                    className="text-ink-muted hover:text-ink"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const inputCls =
  "w-full rounded-lg border border-hairline bg-paper px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-muted/70 outline-none focus:border-ember focus:ring-2 focus:ring-ember/20 transition";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-ink-muted">{label}</span>
      {children}
    </label>
  );
}
