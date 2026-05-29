import { createFileRoute, useRouter, useParams } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Maximize2, Minimize2, Sparkles, Activity, Eye, Settings as SettingsIcon } from "lucide-react";
import { useStory, updateStory, wordCount, useApplyTheme, useUser, updateUser, type ImmersionTheme } from "@/lib/store";
import { ChaptersPanel } from "@/components/workspace/ChaptersPanel";
import { AssistantPanel } from "@/components/workspace/AssistantPanel";
import { Editor } from "@/components/workspace/Editor";
import { StoryHealth } from "@/components/StoryHealth";
import { Particles } from "@/components/Particles";
import { ExportMenu } from "@/components/ExportMenu";
import { StorySettingsDialog } from "@/components/StorySettingsDialog";


export const Route = createFileRoute("/historia/$storyId")({
  head: () => ({ meta: [{ title: "Escribiendo — Everlore" }] }),
  component: Workspace,
});

const IMMERSION_OPTIONS: { id: ImmersionTheme; label: string; className: string }[] = [
  { id: "ninguno",    label: "Sin ambiente",     className: "" },
  { id: "biblioteca", label: "Biblioteca mágica", className: "immersion-library" },
  { id: "lluvia",     label: "Habitación con lluvia", className: "immersion-rain" },
  { id: "bosque",     label: "Bosque nocturno",  className: "immersion-forest" },
  { id: "arcano",     label: "Santuario arcano", className: "immersion-arcane" },
  { id: "cyberpunk",  label: "Cyberpunk",        className: "immersion-cyber" },
  { id: "espacio",    label: "Nave silenciosa",  className: "immersion-space" },
];

function Workspace() {
  useApplyTheme();
  const { storyId } = useParams({ from: "/historia/$storyId" });
  const router = useRouter();
  const user = useUser();
  const story = useStory(storyId);

  const [focus, setFocus] = useState(false);
  const [showAssistant, setShowAssistant] = useState(true);
  const [showHealth, setShowHealth] = useState(false);
  const [immersionMenu, setImmersionMenu] = useState(false);
  const [saveState, setSaveState] = useState<"saved" | "saving">("saved");
  const [settingsOpen, setSettingsOpen] = useState(false);


  useEffect(() => { if (!user) router.navigate({ to: "/login" }); }, [user, router]);
  useEffect(() => {
    if (story === undefined) return;
    if (!story) router.navigate({ to: "/" });
  }, [story, router]);

  const activeScene = useMemo(() => {
    if (!story) return null;
    for (const ch of story.chapters) {
      const sc = ch.scenes.find((s) => s.id === story.lastOpenedSceneId);
      if (sc) return { chapter: ch, scene: sc };
    }
    const fb = story.chapters[0]?.scenes[0];
    return fb ? { chapter: story.chapters[0], scene: fb } : null;
  }, [story]);

  if (!story || !activeScene || !user) return null;

  const immersion = IMMERSION_OPTIONS.find((o) => o.id === user.immersionTheme) ?? IMMERSION_OPTIONS[0];

  function selectScene(sceneId: string) {
    updateStory(storyId, (s) => ({ ...s, lastOpenedSceneId: sceneId }));
  }
  function updateSceneContent(html: string) {
    setSaveState("saving");
    updateStory(storyId, (s) => ({
      ...s,
      chapters: s.chapters.map((c) =>
        c.id === activeScene!.chapter.id
          ? { ...c, scenes: c.scenes.map((sc) => sc.id === activeScene!.scene.id ? { ...sc, content: html } : sc) }
          : c
      ),
    }));
    // grant XP for words
    const w = wordCount(html);
    if (w > 0 && w % 25 === 0) updateUser({ xp: (user?.xp ?? 0) + 1 });
    setTimeout(() => setSaveState("saved"), 400);
  }
  function updateSceneTitle(title: string) {
    updateStory(storyId, (s) => ({
      ...s,
      chapters: s.chapters.map((c) =>
        c.id === activeScene!.chapter.id
          ? { ...c, scenes: c.scenes.map((sc) => sc.id === activeScene!.scene.id ? { ...sc, title } : sc) }
          : c
      ),
    }));
  }
  function updateTitle(title: string) { updateStory(storyId, (s) => ({ ...s, title })); }
  function insertDraft(text: string) {
    const html = text.split("\n").map((p) => `<p>${escapeHtml(p)}</p>`).join("");
    updateSceneContent(activeScene!.scene.content + html);
  }
  function setImmersion(id: ImmersionTheme) {
    updateUser({ immersionTheme: id });
    setImmersionMenu(false);
  }

  const immersive = user.immersionTheme !== "ninguno";

  return (
    <div className={`relative flex h-screen w-full overflow-hidden ${immersive ? immersion.className : "bg-ambient"}`}>
      {immersive && <Particles count={30} />}

      {/* Chapters panel */}
      {!focus && (
        <div className="w-64 shrink-0 hidden md:block relative z-10">
          <ChaptersPanel story={story} activeSceneId={activeScene.scene.id} onSelectScene={selectScene} />
        </div>
      )}

      {/* Center */}
      <div className="flex flex-1 flex-col min-w-0 relative z-10">
        {/* Top bar */}
        {!focus && (
          <div className="flex items-center gap-2 border-b border-hairline px-5 py-3 glass">
            <button
              onClick={() => router.navigate({ to: "/" })}
              className="rounded-md p-1.5 text-ink-muted hover:bg-accent hover:text-mint"
              aria-label="Inicio"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <input
              value={story.title}
              onChange={(e) => updateTitle(e.target.value)}
              className="bg-transparent font-serif text-base text-ink outline-none px-2 py-1 rounded hover:bg-accent/40 focus:bg-accent/60 min-w-0 max-w-[280px]"
            />
            <div className="flex-1" />
            <div className="text-xs text-ink-muted hidden sm:block">
              {wordCount(activeScene.scene.content).toLocaleString("es")} palabras ·{" "}
              <span className="italic">{saveState === "saved" ? "Guardado" : "Guardando…"}</span>
            </div>

            {/* Immersion picker */}
            <div className="relative">
              <button
                onClick={() => setImmersionMenu((v) => !v)}
                className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs transition-all ${
                  immersive ? "border-emerald text-mint bg-accent glow-border" : "border-hairline bg-paper-elevated text-ink hover:border-emerald"
                }`}
              >
                <Eye className="h-3.5 w-3.5" /> Inmersión
              </button>
              {immersionMenu && (
                <div className="absolute right-0 top-full mt-1.5 w-56 rounded-xl glass-strong border border-hairline p-1.5 z-30 animate-fade-up">
                  {IMMERSION_OPTIONS.map((o) => (
                    <button
                      key={o.id} onClick={() => setImmersion(o.id)}
                      className={`w-full text-left text-xs rounded-lg px-2.5 py-2 hover:bg-accent transition ${
                        user.immersionTheme === o.id ? "bg-accent text-mint" : "text-ink"
                      }`}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={() => setShowHealth((v) => !v)}
              className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs transition-all ${
                showHealth ? "bg-accent text-mint border border-emerald" : "border border-hairline bg-paper-elevated text-ink hover:border-emerald"
              }`}
            >
              <Activity className="h-3.5 w-3.5" /> Pulso
            </button>

            <ExportMenu />

            <button
              onClick={() => setSettingsOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-md border border-hairline bg-paper-elevated px-2.5 py-1.5 text-xs text-ink hover:border-emerald"
              title="Ajustes de la historia"
            >
              <SettingsIcon className="h-3.5 w-3.5" />
            </button>


            <button
              onClick={() => setFocus(true)}
              className="inline-flex items-center gap-1.5 rounded-md border border-hairline bg-paper-elevated px-2.5 py-1.5 text-xs text-ink hover:border-emerald"
            >
              <Maximize2 className="h-3.5 w-3.5" /> Concentración
            </button>
            <button
              onClick={() => setShowAssistant((v) => !v)}
              className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs transition-all ${
                showAssistant
                  ? "bg-assistant-surface text-mint border border-emerald"
                  : "border border-hairline bg-paper-elevated text-ink hover:border-emerald"
              }`}
            >
              <Sparkles className="h-3.5 w-3.5" /> Lumi
            </button>
          </div>
        )}

        {focus && (
          <button
            onClick={() => setFocus(false)}
            className="absolute top-4 right-4 z-20 inline-flex items-center gap-1.5 rounded-md glass border border-hairline px-2.5 py-1.5 text-xs text-ink-muted hover:text-mint"
          >
            <Minimize2 className="h-3.5 w-3.5" /> Salir
          </button>
        )}

        {/* Manuscript */}
        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-3xl px-6 md:px-10 py-10 md:py-16">
            {showHealth && !focus && (
              <div className="mb-8 animate-fade-up">
                <StoryHealth story={story} />
              </div>
            )}
            <input
              value={activeScene.scene.title}
              onChange={(e) => updateSceneTitle(e.target.value)}
              className="w-full bg-transparent font-serif text-3xl md:text-4xl text-ink outline-none mb-8 placeholder:text-ink-muted/60"
              placeholder="Título de la escena"
            />
            <Editor
              value={activeScene.scene.content}
              onChange={updateSceneContent}
              placeholder="Empieza por donde quieras. Lumi está aquí."
              fontSize={user?.fontSize ?? 19}
            />
          </div>
        </div>
      </div>

      {/* Assistant */}
      {showAssistant && !focus && (
        <div className="w-[380px] shrink-0 hidden lg:block relative z-10">
          <AssistantPanel story={story} onInsertDraft={insertDraft} />
        </div>
      )}

      <StorySettingsDialog story={settingsOpen ? story : null} onClose={() => setSettingsOpen(false)} onDeleted={() => router.navigate({ to: "/" })} />
    </div>

  );
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}
