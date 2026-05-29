import { createFileRoute, useRouter, useParams } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Maximize2, Minimize2, Sparkles } from "lucide-react";
import { useStory, updateStory, wordCount, useApplyTheme, useUser } from "@/lib/store";
import { ChaptersPanel } from "@/components/workspace/ChaptersPanel";
import { AssistantPanel } from "@/components/workspace/AssistantPanel";
import { Editor } from "@/components/workspace/Editor";

export const Route = createFileRoute("/historia/$storyId")({
  head: () => ({
    meta: [{ title: "Escribiendo — Writedy" }],
  }),
  component: Workspace,
});

function Workspace() {
  useApplyTheme();
  const { storyId } = useParams({ from: "/historia/$storyId" });
  const router = useRouter();
  const user = useUser();
  const story = useStory(storyId);

  const [focus, setFocus] = useState(false);
  const [showAssistant, setShowAssistant] = useState(true);
  const [saveState, setSaveState] = useState<"saved" | "saving">("saved");

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

  if (!story || !activeScene) return null;

  function selectScene(sceneId: string) {
    updateStory(storyId, (s) => ({ ...s, lastOpenedSceneId: sceneId }));
  }

  function updateSceneContent(html: string) {
    setSaveState("saving");
    updateStory(storyId, (s) => ({
      ...s,
      chapters: s.chapters.map((c) =>
        c.id === activeScene!.chapter.id
          ? {
              ...c,
              scenes: c.scenes.map((sc) =>
                sc.id === activeScene!.scene.id ? { ...sc, content: html } : sc
              ),
            }
          : c
      ),
    }));
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

  function updateTitle(title: string) {
    updateStory(storyId, (s) => ({ ...s, title }));
  }

  function insertDraft(text: string) {
    const html = text.split("\n").map((p) => `<p>${escapeHtml(p)}</p>`).join("");
    updateSceneContent(activeScene!.scene.content + html);
  }

  return (
    <div className="flex h-screen w-full bg-paper overflow-hidden">
      {/* Chapters panel */}
      {!focus && (
        <div className="w-64 shrink-0 hidden md:block">
          <ChaptersPanel
            story={story}
            activeSceneId={activeScene.scene.id}
            onSelectScene={selectScene}
          />
        </div>
      )}

      {/* Center */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Top bar */}
        {!focus && (
          <div className="flex items-center gap-3 border-b border-hairline px-5 py-3 bg-paper/95 backdrop-blur">
            <button
              onClick={() => router.navigate({ to: "/" })}
              className="rounded-md p-1.5 text-ink-muted hover:bg-accent hover:text-ink"
              aria-label="Inicio"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <input
              value={story.title}
              onChange={(e) => updateTitle(e.target.value)}
              className="bg-transparent text-sm font-medium text-ink outline-none px-2 py-1 rounded hover:bg-accent/40 focus:bg-accent/60 min-w-0 max-w-[260px]"
            />
            <div className="flex-1" />
            <div className="text-xs text-ink-muted">
              {wordCount(activeScene.scene.content).toLocaleString("es")} palabras ·{" "}
              <span className="italic">{saveState === "saved" ? "Guardado" : "Guardando…"}</span>
            </div>
            <button
              onClick={() => setFocus(true)}
              className="inline-flex items-center gap-1.5 rounded-md border border-hairline bg-paper-elevated px-2.5 py-1.5 text-xs text-ink hover:bg-accent"
            >
              <Maximize2 className="h-3.5 w-3.5" /> Modo concentración
            </button>
            <button
              onClick={() => setShowAssistant((v) => !v)}
              className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs transition-colors ${
                showAssistant ? "bg-assistant-surface text-ink border border-hairline" : "border border-hairline bg-paper-elevated text-ink hover:bg-accent"
              }`}
            >
              <Sparkles className="h-3.5 w-3.5" /> Asistente
            </button>
          </div>
        )}

        {focus && (
          <button
            onClick={() => setFocus(false)}
            className="absolute top-4 right-4 z-20 inline-flex items-center gap-1.5 rounded-md border border-hairline bg-paper-elevated px-2.5 py-1.5 text-xs text-ink-muted hover:text-ink"
          >
            <Minimize2 className="h-3.5 w-3.5" /> Salir del modo concentración
          </button>
        )}

        {/* Manuscript */}
        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-3xl px-6 md:px-10 py-10 md:py-16">
            <input
              value={activeScene.scene.title}
              onChange={(e) => updateSceneTitle(e.target.value)}
              className="w-full bg-transparent font-serif text-3xl md:text-4xl text-ink outline-none mb-8 placeholder:text-ink-muted/60"
              placeholder="Título de la escena"
            />
            <Editor
              value={activeScene.scene.content}
              onChange={updateSceneContent}
              placeholder="Empieza por donde quieras. No tiene que ser perfecto."
              fontSize={user?.fontSize ?? 19}
            />
          </div>
        </div>
      </div>

      {/* Assistant */}
      {showAssistant && !focus && (
        <div className="w-[380px] shrink-0 hidden lg:block">
          <AssistantPanel story={story} onInsertDraft={insertDraft} />
        </div>
      )}
    </div>
  );
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}
