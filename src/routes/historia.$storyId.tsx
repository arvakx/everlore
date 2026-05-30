import { createFileRoute, useRouter, useParams } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft, Maximize2, Minimize2, Sparkles, Activity, Eye, Settings as SettingsIcon,
  History, Check, Loader2, ShieldCheck, BookOpen, Menu, FlaskConical, MoreHorizontal, X,
} from "lucide-react";
import { toast } from "sonner";
import { useStory, updateStory, wordCount, useApplyTheme, useUser, updateUser, upsertStoryLocal, type ImmersionTheme } from "@/lib/store";
import { ChaptersPanel } from "@/components/workspace/ChaptersPanel";
import { AssistantPanel } from "@/components/workspace/AssistantPanel";
import { Editor } from "@/components/workspace/Editor";
import { StoryHealth } from "@/components/StoryHealth";
import { Particles } from "@/components/Particles";
import { ExportMenu } from "@/components/ExportMenu";
import { StorySettingsDialog } from "@/components/StorySettingsDialog";
import { AudioPlayer } from "@/components/AudioPlayer";
import { IMMERSION_TO_CATEGORY, playCategory, useAudioState } from "@/lib/audio";
import { UndoRedo } from "@/components/UndoRedo";
import { VersionHistoryDialog } from "@/components/VersionHistoryDialog";
import { recordChange, seedScene, snapshot } from "@/lib/history";
import { StoryLab } from "@/components/StoryLab";

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
  const [showAssistant, setShowAssistant] = useState(false);
  const [showChapters, setShowChapters] = useState(false);
  const [showHealth, setShowHealth] = useState(false);
  const [immersionMenu, setImmersionMenu] = useState(false);
  const [overflowMenu, setOverflowMenu] = useState(false);
  const [saveState, setSaveState] = useState<"saved" | "saving" | "synced">("saved");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [audioOpen, setAudioOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [labOpen, setLabOpen] = useState(false);
  const audioState = useAudioState();

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastContentRef = useRef<string>("");
  const lastSnapshotRef = useRef<number>(0);
  const lastRecoveryToastRef = useRef<number>(0);

  useEffect(() => { if (!user) router.navigate({ to: "/login" }); }, [user, router]);
  const [recoveryDone, setRecoveryDone] = useState(false);
  useEffect(() => {
    let cancelled = false;
    setRecoveryDone(false);
    if (story) {
      setRecoveryDone(true);
      return () => { cancelled = true; };
    }
    void import("@/lib/stories-sync")
      .then((m) => m.pullStoryById(storyId))
      .then((freshStory) => {
        if (cancelled) return;
        if (freshStory) upsertStoryLocal(freshStory);
      })
      .finally(() => {
        if (!cancelled) setRecoveryDone(true);
      });
    return () => { cancelled = true; };
  }, [storyId, story]);
  useEffect(() => {
    if (story || !recoveryDone) return;
    router.navigate({ to: "/" });
  }, [story, recoveryDone, router]);

  const activeScene = useMemo(() => {
    if (!story) return null;
    for (const ch of story.chapters) {
      const sc = ch.scenes.find((s) => s.id === story.lastOpenedSceneId);
      if (sc) return { chapter: ch, scene: sc };
    }
    const fb = story.chapters[0]?.scenes[0];
    return fb ? { chapter: story.chapters[0], scene: fb } : null;
  }, [story]);

  useEffect(() => {
    if (!activeScene || !story) return;
    seedScene(activeScene.scene.id, activeScene.scene.content);
    lastContentRef.current = activeScene.scene.content;
    lastSnapshotRef.current = Date.now();
    snapshot(story.id, activeScene.scene.id, activeScene.scene.content, "Apertura de la escena");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeScene?.scene.id]);

  if (!story || !activeScene || !user) return null;

  const immersion = IMMERSION_OPTIONS.find((o) => o.id === user.immersionTheme) ?? IMMERSION_OPTIONS[0];

  function selectScene(sceneId: string) {
    updateStory(storyId, (s) => ({ ...s, lastOpenedSceneId: sceneId }));
    setShowChapters(false);
  }

  function plainLen(html: string) {
    return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().length;
  }

  function applyContent(html: string, opts?: { skipHistory?: boolean }) {
    updateStory(storyId, (s) => ({
      ...s,
      chapters: s.chapters.map((c) =>
        c.id === activeScene!.chapter.id
          ? { ...c, scenes: c.scenes.map((sc) => sc.id === activeScene!.scene.id ? { ...sc, content: html } : sc) }
          : c
      ),
    }));
    if (!opts?.skipHistory) recordChange(activeScene!.scene.id, html);
    lastContentRef.current = html;
  }

  function updateSceneContent(html: string) {
    const prev = lastContentRef.current;
    setSaveState("saving");

    const lost = plainLen(prev) - plainLen(html);
    if (lost >= 200 && Date.now() - lastRecoveryToastRef.current > 4000) {
      lastRecoveryToastRef.current = Date.now();
      snapshot(story!.id, activeScene!.scene.id, prev, `Antes de eliminar ${lost} caracteres`);
      toast("Se eliminó un fragmento importante", {
        description: `Lumi guardó la versión anterior (${lost} caracteres). ¿Deseas restaurarla?`,
        duration: 12000,
        action: { label: "Restaurar", onClick: () => applyContent(prev) },
      });
    }

    applyContent(html);

    const w = wordCount(html);
    if (w > 0 && w % 25 === 0) updateUser({ xp: (user?.xp ?? 0) + 1 });

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setSaveState("synced");
      const now = Date.now();
      if (now - lastSnapshotRef.current > 2 * 60 * 1000) {
        snapshot(story!.id, activeScene!.scene.id, html, "Guardado automático");
        lastSnapshotRef.current = now;
      }
      setTimeout(() => setSaveState("saved"), 1400);
    }, 800);
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
    const suggested = IMMERSION_TO_CATEGORY[id];
    if (suggested && audioState.category !== suggested) playCategory(suggested);
  }

  const immersive = user.immersionTheme !== "ninguno";

  return (
    <div
      className={`relative flex h-[100dvh] w-full overflow-hidden aura-transition ${focus ? "focus-mode" : ""} ${immersive ? immersion.className : "bg-ambient"}`}
      style={{ ["--story-aura" as any]: story.coverColor }}
    >
      {immersive && <Particles count={30} />}

      {/* Desktop chapters panel */}
      {!focus && (
        <div className="w-64 shrink-0 hidden lg:block relative z-10">
          <ChaptersPanel story={story} activeSceneId={activeScene.scene.id} onSelectScene={selectScene} />
        </div>
      )}

      {/* Mobile chapters drawer */}
      {showChapters && !focus && (
        <div className="lg:hidden fixed inset-0 z-50 flex animate-fade-up">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowChapters(false)} />
          <div className="relative w-80 max-w-[85vw] h-[100dvh] bg-paper-elevated safe-top safe-bottom">
            <ChaptersPanel story={story} activeSceneId={activeScene.scene.id} onSelectScene={selectScene} />
          </div>
        </div>
      )}

      {/* Center */}
      <div className="flex flex-1 flex-col min-w-0 relative z-10">
        {/* Top bar */}
        {!focus && (
          <div className="flex items-center gap-1.5 sm:gap-2 border-b border-hairline px-3 sm:px-4 py-3 sm:py-[14px] glass safe-top">
            <button
              onClick={() => router.navigate({ to: "/" })}
              className="rounded-md p-1.5 text-ink-muted hover:bg-accent hover:text-mint shrink-0"
              aria-label="Inicio"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>

            <button
              onClick={() => setShowChapters(true)}
              className="lg:hidden rounded-md p-1.5 text-ink-muted hover:bg-accent hover:text-mint shrink-0"
              aria-label="Capítulos"
            >
              <BookOpen className="h-4 w-4" />
            </button>

            <input
              value={story.title}
              title={story.title}
              onChange={(e) => updateTitle(e.target.value)}
              className="bg-transparent font-serif text-sm sm:text-base text-ink outline-none px-1.5 sm:px-2 py-1 rounded hover:bg-accent/40 focus:bg-accent/60 min-w-0 flex-1 sm:flex-none sm:max-w-[280px] truncate"
            />
            <div className="hidden sm:block flex-1" />

            {/* Save indicator */}
            <div className="hidden md:flex items-center gap-1.5 text-xs text-ink-muted">
              <span>{wordCount(activeScene.scene.content).toLocaleString("es")} palabras</span>
              <span className="opacity-40">·</span>
              {saveState === "saving" ? (
                <span className="inline-flex items-center gap-1 text-mint"><Loader2 className="h-3 w-3 animate-spin" /> Sincronizando…</span>
              ) : saveState === "synced" ? (
                <span className="inline-flex items-center gap-1 text-mint"><Check className="h-3 w-3" /> Guardado</span>
              ) : (
                <span className="inline-flex items-center gap-1"><ShieldCheck className="h-3 w-3 text-mint" /> Guardado</span>
              )}
            </div>

            {/* Desktop full toolbar */}
            <div className="hidden md:flex items-center gap-2">
              <UndoRedo
                sceneId={activeScene.scene.id}
                current={activeScene.scene.content}
                onApply={(html) => applyContent(html, { skipHistory: true })}
              />
              <button disabled className={`${toolBtnCls} opacity-50 cursor-not-allowed`} title="Próximamente">
                <History className="h-3.5 w-3.5" /> Historial
                <span className="ml-1 text-[9px] uppercase tracking-widest text-mint/70">Pronto</span>
              </button>

              {/* Immersion */}
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

              <button disabled
                className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs border border-hairline bg-paper-elevated text-ink opacity-50 cursor-not-allowed"
                title="Próximamente">
                <Activity className="h-3.5 w-3.5" /> Pulso
                <span className="ml-1 text-[9px] uppercase tracking-widest text-mint/70">Pronto</span>
              </button>

              <button onClick={() => setLabOpen(true)} className={toolBtnCls} title="Laboratorio narrativo">
                <FlaskConical className="h-3.5 w-3.5" /> Lab
              </button>

              <ExportMenu />

              <button onClick={() => setSettingsOpen(true)} className={toolBtnCls} title="Ajustes">
                <SettingsIcon className="h-3.5 w-3.5" />
              </button>

              <button onClick={() => setFocus(true)} className={toolBtnCls}>
                <Maximize2 className="h-3.5 w-3.5" /> Concentración
              </button>

              <button onClick={() => setShowAssistant((v) => !v)}
                className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs transition-all ${
                  showAssistant ? "bg-assistant-surface text-mint border border-emerald" : "border border-hairline bg-paper-elevated text-ink hover:border-emerald"
                }`}>
                <Sparkles className="h-3.5 w-3.5" /> Lumi
              </button>
            </div>

            {/* Mobile compact toolbar */}
            <div className="md:hidden flex items-center gap-0.5 shrink-0">
              {saveState === "saving" ? (
                <Loader2 className="h-3.5 w-3.5 text-mint animate-spin mr-1" aria-label="Sincronizando" />
              ) : (
                <Check className="h-3.5 w-3.5 text-mint/70 mr-1" aria-label="Guardado" />
              )}
              <UndoRedo
                sceneId={activeScene.scene.id}
                current={activeScene.scene.content}
                onApply={(html) => applyContent(html, { skipHistory: true })}
              />
              <button
                onClick={() => setShowAssistant(true)}
                className="rounded-md p-1.5 text-mint hover:bg-accent"
                aria-label="Lumi"
              >
                <Sparkles className="h-4 w-4" />
              </button>
              <button
                onClick={() => setOverflowMenu((v) => !v)}
                className="rounded-md p-1.5 text-ink hover:bg-accent relative"
                aria-label="Más opciones"
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Mobile overflow menu */}
        {overflowMenu && !focus && (
          <div className="md:hidden fixed inset-0 z-40 animate-fade-up" onClick={() => setOverflowMenu(false)}>
            <div className="absolute inset-0 bg-black/50" />
            <div className="absolute top-16 right-3 left-3 rounded-2xl glass-strong border border-hairline p-2 grid grid-cols-3 gap-1.5 safe-top" onClick={(e) => e.stopPropagation()}>
              <MobileToolBtn icon={<Eye className="h-4 w-4" />} label="Inmersión" onClick={() => { setOverflowMenu(false); setImmersionMenu(true); }} />
              <MobileToolBtn disabled icon={<Activity className="h-4 w-4" />} label="Pulso" onClick={() => {}} />
              <MobileToolBtn icon={<FlaskConical className="h-4 w-4" />} label="Lab" onClick={() => { setLabOpen(true); setOverflowMenu(false); }} />
              <MobileToolBtn disabled icon={<History className="h-4 w-4" />} label="Historial" onClick={() => {}} />
              <MobileToolBtn icon={<SettingsIcon className="h-4 w-4" />} label="Ajustes" onClick={() => { setSettingsOpen(true); setOverflowMenu(false); }} />
              <MobileToolBtn icon={<Maximize2 className="h-4 w-4" />} label="Foco" onClick={() => { setFocus(true); setOverflowMenu(false); }} />
            </div>

            {/* Mobile immersion sheet */}
            {immersionMenu && (
              <div className="absolute inset-x-3 bottom-3 rounded-2xl glass-strong border border-hairline p-2 z-50 safe-bottom max-h-[70vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                {IMMERSION_OPTIONS.map((o) => (
                  <button key={o.id} onClick={() => { setImmersion(o.id); setOverflowMenu(false); }}
                    className={`w-full text-left text-sm rounded-lg px-3 py-2.5 hover:bg-accent transition ${
                      user.immersionTheme === o.id ? "bg-accent text-mint" : "text-ink"
                    }`}>
                    {o.label}
                  </button>
                ))}
              </div>
            )}
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
          <div className="mx-auto max-w-3xl px-4 sm:px-6 md:px-10 py-6 sm:py-10 md:py-16 pb-28 sm:pb-32">
            {showHealth && !focus && (
              <div className="mb-6 sm:mb-8 animate-fade-up">
                <StoryHealth story={story} />
              </div>
            )}
            <input
              value={activeScene.scene.title}
              onChange={(e) => updateSceneTitle(e.target.value)}
              className="w-full bg-transparent font-serif text-2xl sm:text-3xl md:text-4xl text-ink outline-none mb-5 sm:mb-8 placeholder:text-ink-muted/60"
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

      {/* Assistant — desktop pinned */}
      {showAssistant && !focus && (
        <div className="w-[380px] shrink-0 hidden xl:block relative z-10">
          <AssistantPanel story={story} onInsertDraft={insertDraft} />
        </div>
      )}

      {/* Assistant — mobile/tablet sheet */}
      {showAssistant && !focus && (
        <div className="xl:hidden fixed inset-0 z-50 flex justify-end animate-fade-up">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowAssistant(false)} />
          <div className="relative w-full sm:w-[420px] max-w-full h-[100dvh] bg-paper-elevated border-l border-hairline safe-top safe-bottom">
            <button
              onClick={() => setShowAssistant(false)}
              className="absolute top-3 right-3 z-10 rounded-md p-1.5 glass border border-hairline text-ink-muted hover:text-ink"
              aria-label="Cerrar"
            >
              <X className="h-4 w-4" />
            </button>
            <AssistantPanel story={story} onInsertDraft={insertDraft} />
          </div>
        </div>
      )}

      <StorySettingsDialog story={settingsOpen ? story : null} onClose={() => setSettingsOpen(false)} onDeleted={() => router.navigate({ to: "/" })} />
      <AudioPlayer variant="mini" open={audioOpen} onClose={() => setAudioOpen(false)} />
      <VersionHistoryDialog
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        storyId={storyId}
        sceneId={activeScene.scene.id}
        currentContent={activeScene.scene.content}
        onRestore={(html) => applyContent(html)}
      />
      <StoryLab story={story} open={labOpen} onClose={() => setLabOpen(false)} onInsertText={insertDraft} />
    </div>
  );
}

const toolBtnCls =
  "inline-flex items-center gap-1.5 rounded-md border border-hairline bg-paper-elevated px-2.5 py-1.5 text-xs text-ink hover:border-emerald hover:text-mint transition";

function MobileToolBtn({ icon, label, onClick, disabled }: { icon: React.ReactNode; label: string; onClick: () => void; disabled?: boolean }) {
  return (
    <button onClick={disabled ? undefined : onClick} disabled={disabled} title={disabled ? "Próximamente" : undefined}
      className={`relative flex flex-col items-center gap-1 rounded-xl border border-hairline bg-paper-elevated/70 px-2 py-3 text-[10px] uppercase tracking-widest text-ink transition ${
        disabled ? "opacity-50 cursor-not-allowed" : "hover:border-emerald hover:text-mint"
      }`}>
      {icon}
      <span>{label}</span>
      {disabled && <span className="absolute -top-1.5 right-1 text-[8px] tracking-widest text-mint/80 bg-paper-elevated border border-hairline rounded px-1">Pronto</span>}
    </button>
  );
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}
