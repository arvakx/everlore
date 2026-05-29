import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { useUser, updateUser, useStories, planLimits, planLabels, computeRank, computeAchievements } from "@/lib/store";
import { UpgradeDialog } from "@/components/UpgradeDialog";
import { Trophy, Lock, Check } from "lucide-react";

export const Route = createFileRoute("/ajustes")({
  head: () => ({ meta: [{ title: "Ajustes — Everlore" }] }),
  component: Settings,
});

function Settings() {
  const user = useUser();
  const stories = useStories();
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  if (!user) return <AppShell><div /></AppShell>;
  const limit = planLimits[user.plan];
  const rank = computeRank(user.xp);
  const achievements = computeAchievements(stories);

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl px-6 py-12">
        <header className="mb-12 animate-fade-up">
          <div className="text-[11px] uppercase tracking-[0.25em] text-mint mb-2">Tu santuario</div>
          <h1 className="font-serif text-4xl text-ink">Ajustes</h1>
        </header>

        <Section title="Rango y progreso">
          <div className="rounded-2xl glass p-6 glow-border">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full gradient-emerald glow-ring">
                <Trophy className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-widest text-mint">Nivel {rank.level}</div>
                <div className="font-serif text-xl text-ink">{rank.title}</div>
              </div>
            </div>
            <div className="h-1.5 rounded-full bg-hairline overflow-hidden">
              <div className="h-full gradient-emerald transition-all" style={{ width: `${rank.progress * 100}%` }} />
            </div>
            <div className="mt-2 flex justify-between text-[11px] text-ink-muted">
              <span>{user.xp} XP</span>
              <span>{rank.nextXp} XP siguiente</span>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-4">
            {achievements.map((a) => (
              <div
                key={a.id}
                className={`rounded-xl border p-3 transition-all ${
                  a.unlocked ? "border-emerald/50 glass glow-border" : "border-hairline bg-paper-elevated/40 opacity-60"
                }`}
              >
                <div className="flex items-center gap-1.5">
                  {a.unlocked ? <Check className="h-3.5 w-3.5 text-mint" /> : <Lock className="h-3.5 w-3.5 text-ink-muted" />}
                  <div className="text-xs font-medium text-ink">{a.title}</div>
                </div>
                <div className="mt-1 text-[11px] text-ink-muted leading-snug">{a.description}</div>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Perfil">
          <Field label="Nombre">
            <input value={user.name} onChange={(e) => updateUser({ name: e.target.value })} className={inputCls} />
          </Field>
          <Field label="Correo electrónico">
            <input value={user.email} onChange={(e) => updateUser({ email: e.target.value })} className={inputCls} />
          </Field>
        </Section>

        <Section title="Mi plan">
          <div className="rounded-2xl glass p-5 glow-border">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[10px] uppercase tracking-widest text-mint">Plan actual</div>
                <div className="font-serif text-xl text-ink">{planLabels[user.plan]}</div>
                <div className="mt-1 text-sm text-ink-muted">
                  {stories.length} de {limit === Infinity ? "∞" : limit} historias activas
                </div>
              </div>
              <button
                onClick={() => setUpgradeOpen(true)}
                className="rounded-xl gradient-emerald px-5 py-2.5 text-sm font-medium text-primary-foreground hover:shadow-glow transition"
              >
                {user.plan === "leyenda" ? "Ver planes" : "Evolucionar"}
              </button>
            </div>
          </div>
        </Section>

        <Section title="Preferencias de escritura">
          <Field label={`Tamaño del texto del editor (${user.fontSize}px)`}>
            <input
              type="range" min={16} max={24} value={user.fontSize}
              onChange={(e) => updateUser({ fontSize: Number(e.target.value) })}
              className="w-full accent-emerald"
            />
          </Field>
          <Field label="Tema">
            <div className="flex gap-2">
              {(["dark", "light"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => updateUser({ theme: t })}
                  className={`rounded-xl border px-4 py-2 text-sm transition-all ${
                    user.theme === t ? "border-emerald bg-accent text-mint glow-border" : "border-hairline bg-paper-elevated text-ink-muted hover:text-ink"
                  }`}
                >
                  {t === "dark" ? "Noche cinemática" : "Pergamino cálido"}
                </button>
              ))}
            </div>
          </Field>
          <Field label="Sugerencias proactivas de Lumi">
            <div className="flex gap-2">
              <button
                onClick={() => updateUser({ proactiveNudges: true })}
                className={`rounded-xl border px-4 py-2 text-sm ${user.proactiveNudges ? "border-emerald bg-accent text-mint" : "border-hairline bg-paper-elevated text-ink-muted hover:text-ink"}`}
              >
                Activadas
              </button>
              <button
                onClick={() => updateUser({ proactiveNudges: false })}
                className={`rounded-xl border px-4 py-2 text-sm ${!user.proactiveNudges ? "border-emerald bg-accent text-mint" : "border-hairline bg-paper-elevated text-ink-muted hover:text-ink"}`}
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
    <section className="mb-10 animate-fade-up">
      <h2 className="font-serif text-xl text-ink mb-4">{title}</h2>
      <div className="space-y-4">{children}</div>
    </section>
  );
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] uppercase tracking-[0.15em] text-ink-muted">{label}</span>
      {children}
    </label>
  );
}
const inputCls = "w-full rounded-xl border border-hairline bg-paper-elevated/60 px-4 py-2.5 text-sm text-ink outline-none focus:border-emerald focus:ring-2 focus:ring-emerald/20 transition";
