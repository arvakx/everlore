import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import {
  useUser, updateUser, useStories, planLimits, planLabels, computeRank, computeAchievements,
  SPECIALISTS, resolveSpecialist, type AiSpecialist,
} from "@/lib/store";
import { UpgradeDialog } from "@/components/UpgradeDialog";
import { LumiAvatar } from "@/components/LumiAvatar";
import { Trophy, Lock, Check, RotateCcw, Sparkles } from "lucide-react";

export const Route = createFileRoute("/ajustes")({
  head: () => ({ meta: [{ title: "Ajustes — Everlore" }] }),
  component: Settings,
});

type Tab = "perfil" | "agentes" | "progreso";

function Settings() {
  const user = useUser();
  const stories = useStories();
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [tab, setTab] = useState<Tab>("perfil");
  if (!user) return <AppShell><div /></AppShell>;
  const limit = planLimits[user.plan];
  const rank = computeRank(user.xp);
  const achievements = computeAchievements(stories);

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl px-6 py-12">
        <header className="mb-8 animate-fade-up">
          <div className="text-[11px] uppercase tracking-[0.25em] text-mint mb-2">Tu santuario</div>
          <h1 className="font-serif text-4xl text-ink">Ajustes</h1>
        </header>

        <div className="mb-8 flex gap-1 border-b border-hairline">
          {([
            ["perfil", "Perfil y preferencias"],
            ["agentes", "Agentes IA"],
            ["progreso", "Rango y progreso"],
          ] as [Tab, string][]).map(([id, label]) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`relative px-4 py-2.5 text-sm transition ${
                tab === id ? "text-mint" : "text-ink-muted hover:text-ink"
              }`}
            >
              {label}
              {tab === id && <span className="absolute bottom-[-1px] left-0 right-0 h-0.5 gradient-emerald rounded-full" />}
            </button>
          ))}
        </div>

        {tab === "progreso" && (
          <>
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
          </>
        )}

        {tab === "agentes" && <AgentsTab />}

        {tab === "perfil" && (
          <>
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
          </>
        )}
      </div>

      <UpgradeDialog open={upgradeOpen} onClose={() => setUpgradeOpen(false)} />
    </AppShell>
  );
}

function AgentsTab() {
  const user = useUser();
  if (!user) return null;

  function patch(id: AiSpecialist, key: "name" | "tagline", value: string) {
    const current = user!.agentOverrides ?? {};
    const prev = current[id] ?? {};
    updateUser({
      agentOverrides: { ...current, [id]: { ...prev, [key]: value } },
    });
  }
  function reset(id: AiSpecialist) {
    const current = { ...(user!.agentOverrides ?? {}) };
    delete current[id];
    updateUser({ agentOverrides: current });
  }

  return (
    <section className="animate-fade-up">
      <div className="mb-6 rounded-2xl glass p-5 glow-border flex items-start gap-3">
        <Sparkles className="h-5 w-5 text-mint mt-0.5 shrink-0" />
        <div>
          <h2 className="font-serif text-xl text-ink">Tus agentes IA</h2>
          <p className="text-sm text-ink-muted mt-1 leading-relaxed">
            Lumi y los demás especialistas están aquí para acompañarte. Renómbralos y reescribe su esencia para que se sientan tuyos.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {SPECIALISTS.map((s) => {
          const r = resolveSpecialist(s.id, user);
          const overridden = !!user.agentOverrides?.[s.id];
          return (
            <div key={s.id} className="rounded-2xl glass p-5 glow-border">
              <div className="flex items-start gap-3 mb-4">
                <LumiAvatar size={36} state={s.id === "lumi" ? "mystic" : s.id === "terror" ? "thinking" : "idle"} />
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] uppercase tracking-widest text-mint">
                    Agente original: {s.name}
                    {s.id === "lumi" && <span className="ml-1.5 text-ink-muted/70 normal-case tracking-normal">· agente principal</span>}
                  </div>
                  <div className="font-serif text-lg text-ink leading-tight">{r.name}</div>
                  <div className="text-xs text-ink-muted italic">{r.tagline}</div>
                </div>
                {overridden && (
                  <button
                    onClick={() => reset(s.id)}
                    className="inline-flex items-center gap-1 rounded-md border border-hairline px-2 py-1 text-[11px] text-ink-muted hover:border-emerald hover:text-mint transition"
                    title="Restaurar valores originales"
                  >
                    <RotateCcw className="h-3 w-3" /> Restaurar
                  </button>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-3">
                <Field label="Nombre del agente">
                  <input
                    value={user.agentOverrides?.[s.id]?.name ?? ""}
                    onChange={(e) => patch(s.id, "name", e.target.value)}
                    placeholder={s.name}
                    className={inputCls}
                  />
                </Field>
                <Field label="Descripción / especialidad">
                  <input
                    value={user.agentOverrides?.[s.id]?.tagline ?? ""}
                    onChange={(e) => patch(s.id, "tagline", e.target.value)}
                    placeholder={s.tagline}
                    className={inputCls}
                  />
                </Field>
              </div>
              <div className="mt-2 text-[10px] text-ink-muted/80">
                Tono base: <span className="italic">{s.tone}</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
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
