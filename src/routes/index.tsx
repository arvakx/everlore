import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import {
  useUser, useStories, timeOfDayGreeting, relativeEs, canCreateStory,
  storyWordCount, computeRank, type Story,
} from "@/lib/store";
import { generateReentryLine } from "@/lib/assistant";
import { NewStoryDialog } from "@/components/NewStoryDialog";
import { UpgradeDialog } from "@/components/UpgradeDialog";
import { StorySettingsDialog } from "@/components/StorySettingsDialog";
import { ExportMenu } from "@/components/ExportMenu";
import { LumiAvatar } from "@/components/LumiAvatar";
import { Particles } from "@/components/Particles";
import { Plus, BookOpen, Sparkles, Settings as SettingsIcon } from "lucide-react";


export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Biblioteca — Everlore" },
      { name: "description", content: "Tu universo de historias en Everlore." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const user = useUser();
  const stories = useStories();
  const router = useRouter();
  const [newOpen, setNewOpen] = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [settingsStory, setSettingsStory] = useState<Story | null>(null);


  if (!user) return <AppShell><div /></AppShell>;

  const sorted = [...stories].sort((a, b) => b.updatedAt - a.updatedAt);
  const hero = sorted[0];
  const rank = computeRank(user.xp);

  function tryCreate() {
    if (canCreateStory(user)) setNewOpen(true);
    else setUpgradeOpen(true);
  }

  return (
    <AppShell>
      <div className="relative">
        <Particles count={12} />
        <div className="relative mx-auto max-w-6xl px-6 py-12 md:px-10 md:py-16">
          <header className="mb-12 animate-fade-up">
            <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.25em] text-mint mb-3">
              <Sparkles className="h-3 w-3" /> {rank.title}
            </div>
            <h1 className="font-serif text-4xl md:text-5xl text-ink leading-tight">
              {timeOfDayGreeting()}, <span className="gradient-text">{user.name.split(" ")[0]}</span>.
            </h1>
            <p className="mt-3 text-ink-muted text-lg italic">
              Lumi ha estado pensando en tu historia.
            </p>
          </header>

          {hero ? (
            <ReentryHero
              story={hero}
              onOpen={() => router.navigate({ to: "/historia/$storyId", params: { storyId: hero.id } })}
            />
          ) : (
            <EmptyState onCreate={tryCreate} />
          )}

          {sorted.length > 0 && (
            <section className="mt-16 animate-fade-up">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="font-serif text-2xl text-ink">Tu biblioteca</h2>
                <button
                  onClick={tryCreate}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-hairline glass px-4 py-2 text-sm text-ink hover:border-emerald hover:text-mint transition-all"
                >
                  <Plus className="h-4 w-4" /> Nueva historia
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {sorted.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => router.navigate({ to: "/historia/$storyId", params: { storyId: s.id } })}
                    className="group text-left rounded-2xl glass p-5 transition-all hover:glow-ring hover:-translate-y-1 hover:border-emerald/50"
                  >
                    <div className="flex gap-4">
                      <div
                        className="h-24 w-16 rounded-md shrink-0 relative overflow-hidden"
                        style={{
                          background: `linear-gradient(160deg, ${s.coverColor}, ${s.coverColor}80)`,
                          boxShadow: `0 0 24px ${s.coverColor}55`,
                        }}
                      >
                        <div className="absolute inset-0 opacity-30" style={{
                          background: "linear-gradient(180deg, transparent 60%, rgba(0,0,0,0.4))",
                        }} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-serif text-lg text-ink truncate group-hover:text-mint transition-colors">
                          {s.title}
                        </div>
                        {s.logline && (
                          <div className="mt-1 text-xs text-ink-muted line-clamp-2 italic">{s.logline}</div>
                        )}
                        <div className="mt-2 flex items-center gap-2 text-[11px] text-ink-muted">
                          <span>{storyWordCount(s).toLocaleString("es")} palabras</span>
                          <span className="h-1 w-1 rounded-full bg-hairline" />
                          <span>{s.chapters.length} cap.</span>
                        </div>
                        <div className="mt-0.5 text-[10px] text-ink-muted/80">
                          Editado {relativeEs(s.updatedAt)}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}

                <button
                  onClick={tryCreate}
                  className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-hairline bg-transparent p-5 min-h-[140px] text-ink-muted hover:border-emerald hover:text-mint transition-all hover:bg-accent/20"
                >
                  <Plus className="h-7 w-7 mb-2" />
                  <span className="text-sm font-medium">Forjar nueva historia</span>
                </button>
              </div>
            </section>
          )}
        </div>
      </div>

      <NewStoryDialog
        open={newOpen}
        onClose={() => setNewOpen(false)}
        onCreated={(id) => { setNewOpen(false); router.navigate({ to: "/historia/$storyId", params: { storyId: id } }); }}
      />
      <UpgradeDialog open={upgradeOpen} onClose={() => setUpgradeOpen(false)} />
    </AppShell>
  );
}

function ReentryHero({ story, onOpen }: { story: ReturnType<typeof useStories>[number]; onOpen: () => void }) {
  const { summary, thread } = generateReentryLine(story);
  return (
    <section className="relative rounded-3xl glass-strong p-8 md:p-12 glow-border overflow-hidden animate-fade-up">
      <div
        className="absolute -top-32 -right-32 h-80 w-80 rounded-full opacity-30 blur-3xl"
        style={{ background: story.coverColor }}
      />
      <div className="absolute inset-y-0 left-0 w-1" style={{ background: `linear-gradient(180deg, ${story.coverColor}, transparent)` }} />

      <div className="relative">
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.25em] text-mint mb-4">
          <LumiAvatar size={18} state="idle" /> Continúa donde lo dejaste
        </div>
        <h2 className="font-serif text-3xl md:text-4xl text-ink">{story.title}</h2>
        <p className="mt-5 text-ink leading-relaxed max-w-2xl">{summary}</p>
        <p className="mt-3 text-mint italic leading-relaxed max-w-2xl">
          “{thread}”
        </p>
        <button
          onClick={onOpen}
          className="mt-8 inline-flex items-center gap-2 rounded-xl gradient-emerald px-6 py-3.5 text-sm font-medium text-primary-foreground hover:shadow-glow-lg transition-all active:scale-[0.98]"
        >
          <BookOpen className="h-4 w-4" /> Continuar mi historia
        </button>
      </div>
    </section>
  );
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <section className="rounded-3xl glass-strong p-10 md:p-16 text-center glow-border animate-fade-up">
      <div className="mx-auto mb-6">
        <LumiAvatar size={84} state="mystic" />
      </div>
      <h2 className="font-serif text-3xl md:text-4xl text-ink">Tu primera historia espera.</h2>
      <p className="mx-auto mt-4 max-w-xl text-ink-muted leading-relaxed">
        No necesitas tenerlo todo claro. Una idea, una imagen, una pregunta. Lumi
        camina contigo desde la primera palabra.
      </p>
      <button
        onClick={onCreate}
        className="mt-8 rounded-xl gradient-emerald px-7 py-3.5 text-sm font-medium text-primary-foreground hover:shadow-glow-lg transition-all active:scale-[0.98]"
      >
        Encender mi primera historia
      </button>

      <div className="mt-10 flex flex-wrap justify-center gap-2">
        {[
          "Tengo una idea pero no sé por dónde empezar",
          "Quiero escribir pero no se me ocurre nada",
          "Ya tengo algo escrito y quiero continuarlo",
        ].map((chip) => (
          <button
            key={chip}
            onClick={onCreate}
            className="rounded-full border border-hairline glass px-4 py-2 text-xs text-ink-muted hover:border-emerald hover:text-mint transition-all"
          >
            {chip}
          </button>
        ))}
      </div>
    </section>
  );
}
