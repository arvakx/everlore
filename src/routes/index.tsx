import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import {
  useUser, useStories, timeOfDayGreeting, relativeEs, canCreateStory,
  storyWordCount,
} from "@/lib/store";
import { generateReentryLine } from "@/lib/assistant";
import { NewStoryDialog } from "@/components/NewStoryDialog";
import { UpgradeDialog } from "@/components/UpgradeDialog";
import { Plus, BookOpen } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Inicio — Writedy" },
      { name: "description", content: "Tu biblioteca de historias en Writedy." },
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

  if (!user) return <AppShell><div /></AppShell>;

  const sorted = [...stories].sort((a, b) => b.updatedAt - a.updatedAt);
  const hero = sorted[0];
  const rest = sorted.slice(1);

  function tryCreate() {
    if (canCreateStory(user)) setNewOpen(true);
    else setUpgradeOpen(true);
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-6xl px-6 py-10 md:px-10 md:py-14">
        <header className="mb-10">
          <h1 className="font-serif text-3xl md:text-4xl text-ink">
            {timeOfDayGreeting()}, {user.name}.
          </h1>
          <p className="mt-2 text-ink-muted">¿Listo para volver a tu historia?</p>
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
          <section className="mt-14">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-serif text-xl text-ink">Mis historias</h2>
              <button
                onClick={tryCreate}
                className="inline-flex items-center gap-1.5 rounded-lg border border-hairline bg-paper-elevated px-3 py-1.5 text-sm text-ink hover:bg-accent"
              >
                <Plus className="h-4 w-4" /> Nueva historia
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {sorted.map((s) => (
                <button
                  key={s.id}
                  onClick={() => router.navigate({ to: "/historia/$storyId", params: { storyId: s.id } })}
                  className="group text-left rounded-2xl border border-hairline bg-paper-elevated p-5 shadow-soft transition-all hover:shadow-paper hover:-translate-y-0.5"
                >
                  <div className="flex gap-4">
                    <div
                      className="h-20 w-14 rounded-md shadow-soft shrink-0"
                      style={{ background: s.coverColor }}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="font-serif text-lg text-ink truncate group-hover:text-ember transition-colors">
                        {s.title}
                      </div>
                      <div className="mt-1 text-xs text-ink-muted">
                        {storyWordCount(s).toLocaleString("es")} palabras · {s.chapters.length} cap.
                      </div>
                      <div className="mt-1 text-xs text-ink-muted">
                        Editado {relativeEs(s.updatedAt)}
                      </div>
                    </div>
                  </div>
                </button>
              ))}

              <button
                onClick={tryCreate}
                className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-hairline bg-transparent p-5 min-h-[140px] text-ink-muted hover:border-ember hover:text-ember transition-colors"
              >
                <Plus className="h-6 w-6 mb-1" />
                <span className="text-sm font-medium">Nueva historia</span>
              </button>
            </div>
          </section>
        )}
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
    <section
      className="rounded-3xl border border-hairline bg-paper-elevated p-7 md:p-10 shadow-paper relative overflow-hidden"
    >
      <div className="absolute inset-y-0 left-0 w-1.5" style={{ background: story.coverColor }} />
      <div className="text-xs uppercase tracking-wider text-ink-muted mb-3">
        Continúa donde lo dejaste
      </div>
      <h2 className="font-serif text-2xl md:text-3xl text-ink">{story.title}</h2>
      <p className="mt-4 text-ink leading-relaxed max-w-2xl">{summary}</p>
      <p className="mt-3 text-assistant-accent italic leading-relaxed max-w-2xl">
        “{thread}”
      </p>
      <button
        onClick={onOpen}
        className="mt-7 inline-flex items-center gap-2 rounded-lg bg-ember px-5 py-3 text-sm font-medium text-primary-foreground hover:bg-ember-hover transition-colors"
      >
        <BookOpen className="h-4 w-4" /> Seguir escribiendo
      </button>
    </section>
  );
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <section className="rounded-3xl border border-hairline bg-paper-elevated p-8 md:p-14 text-center shadow-paper">
      <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-accent">
        <BookOpen className="h-6 w-6 text-assistant-accent" />
      </div>
      <h2 className="font-serif text-2xl md:text-3xl text-ink">Empecemos tu primera historia.</h2>
      <p className="mx-auto mt-3 max-w-xl text-ink-muted leading-relaxed">
        No necesitas tener todo claro. Empieza con una idea, una frase, o incluso una sola pregunta.
        Yo te acompaño desde aquí.
      </p>
      <button
        onClick={onCreate}
        className="mt-7 rounded-lg bg-ember px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-ember-hover"
      >
        Crear mi primera historia
      </button>

      <div className="mt-8 flex flex-wrap justify-center gap-2">
        {[
          "Tengo una idea pero no sé por dónde empezar",
          "Quiero escribir pero no se me ocurre nada",
          "Ya tengo algo escrito y quiero continuarlo",
        ].map((chip) => (
          <button
            key={chip}
            onClick={onCreate}
            className="rounded-full border border-hairline bg-paper px-4 py-2 text-xs text-ink-muted hover:border-ember hover:text-ember transition-colors"
          >
            {chip}
          </button>
        ))}
      </div>
    </section>
  );
}
