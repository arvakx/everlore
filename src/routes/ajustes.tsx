import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { useUser, updateUser, useStories, planLimits } from "@/lib/store";
import { UpgradeDialog } from "@/components/UpgradeDialog";

export const Route = createFileRoute("/ajustes")({
  head: () => ({ meta: [{ title: "Ajustes — Writedy" }] }),
  component: Settings,
});

function Settings() {
  const user = useUser();
  const stories = useStories();
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  if (!user) return <AppShell><div/></AppShell>;
  const limit = planLimits[user.plan];

  return (
    <AppShell>
      <div className="mx-auto max-w-2xl px-6 py-12">
        <h1 className="font-serif text-3xl text-ink mb-10">Ajustes</h1>

        <Section title="Perfil">
          <Field label="Nombre">
            <input value={user.name} onChange={(e) => updateUser({ name: e.target.value })} className={inputCls} />
          </Field>
          <Field label="Correo electrónico">
            <input value={user.email} onChange={(e) => updateUser({ email: e.target.value })} className={inputCls} />
          </Field>
        </Section>

        <Section title="Mi plan">
          <div className="rounded-xl border border-hairline bg-paper-elevated p-5">
            <div className="font-medium text-ink">
              {user.plan === "free" ? "Plan Gratuito" : "Plan Autor"}
            </div>
            <div className="mt-1 text-sm text-ink-muted">
              {stories.length} de {limit === Infinity ? "∞" : limit} historias usadas
            </div>
            {user.plan === "free" ? (
              <button
                onClick={() => setUpgradeOpen(true)}
                className="mt-4 rounded-lg bg-ember px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-ember-hover"
              >
                Mejorar plan
              </button>
            ) : (
              <button
                onClick={() => updateUser({ plan: "free" })}
                className="mt-4 rounded-lg border border-hairline bg-paper px-4 py-2 text-sm text-ink-muted hover:text-ink"
              >
                Volver al Plan Gratuito
              </button>
            )}
          </div>
        </Section>

        <Section title="Preferencias de escritura">
          <Field label={`Tamaño del texto del editor (${user.fontSize}px)`}>
            <input
              type="range" min={16} max={24} value={user.fontSize}
              onChange={(e) => updateUser({ fontSize: Number(e.target.value) })}
              className="w-full accent-ember"
            />
          </Field>
          <Field label="Tema">
            <div className="flex gap-2">
              {(["light", "dark"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => updateUser({ theme: t })}
                  className={`rounded-lg border px-4 py-2 text-sm transition-colors ${
                    user.theme === t ? "border-ember bg-accent text-ink" : "border-hairline bg-paper-elevated text-ink-muted hover:text-ink"
                  }`}
                >
                  {t === "light" ? "Cálido" : "Modo noche"}
                </button>
              ))}
            </div>
          </Field>
          <Field label="Sugerencias del asistente">
            <div className="flex gap-2">
              <button
                onClick={() => updateUser({ proactiveNudges: true })}
                className={`rounded-lg border px-4 py-2 text-sm ${user.proactiveNudges ? "border-ember bg-accent text-ink" : "border-hairline bg-paper-elevated text-ink-muted hover:text-ink"}`}
              >
                Activadas
              </button>
              <button
                onClick={() => updateUser({ proactiveNudges: false })}
                className={`rounded-lg border px-4 py-2 text-sm ${!user.proactiveNudges ? "border-ember bg-accent text-ink" : "border-hairline bg-paper-elevated text-ink-muted hover:text-ink"}`}
              >
                Solo cuando yo pregunte
              </button>
            </div>
          </Field>
        </Section>
      </div>

      <UpgradeDialog open={upgradeOpen} onClose={() => setUpgradeOpen(false)} />
    </AppShell>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="font-serif text-lg text-ink mb-4">{title}</h2>
      <div className="space-y-4">{children}</div>
    </section>
  );
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-ink-muted">{label}</span>
      {children}
    </label>
  );
}
const inputCls = "w-full rounded-lg border border-hairline bg-paper-elevated px-3.5 py-2.5 text-sm text-ink outline-none focus:border-ember focus:ring-2 focus:ring-ember/20 transition";
