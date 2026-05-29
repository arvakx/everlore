import { useState } from "react";
import { ChevronRight, ChevronDown, Plus, Map } from "lucide-react";
import { Link } from "@tanstack/react-router";
import type { Story } from "@/lib/store";
import { newId, updateStory, wordCount } from "@/lib/store";

interface Props {
  story: Story;
  activeSceneId?: string;
  onSelectScene: (sceneId: string) => void;
}

export function ChaptersPanel({ story, activeSceneId, onSelectScene }: Props) {
  const [openChapters, setOpenChapters] = useState<Record<string, boolean>>(
    Object.fromEntries(story.chapters.map((c) => [c.id, true]))
  );

  function toggle(id: string) { setOpenChapters((p) => ({ ...p, [id]: !p[id] })); }

  function addChapter() {
    updateStory(story.id, (s) => ({
      ...s,
      chapters: [
        ...s.chapters,
        { id: newId(), title: `Capítulo ${s.chapters.length + 1}`, scenes: [{ id: newId(), title: "Escena nueva", content: "" }] },
      ],
    }));
  }
  function addScene(chapterId: string) {
    updateStory(story.id, (s) => ({
      ...s,
      chapters: s.chapters.map((c) =>
        c.id === chapterId ? { ...c, scenes: [...c.scenes, { id: newId(), title: "Escena nueva", content: "" }] } : c
      ),
    }));
  }
  function renameChapter(chapterId: string, title: string) {
    updateStory(story.id, (s) => ({ ...s, chapters: s.chapters.map((c) => c.id === chapterId ? { ...c, title } : c) }));
  }
  function renameScene(chapterId: string, sceneId: string, title: string) {
    updateStory(story.id, (s) => ({
      ...s,
      chapters: s.chapters.map((c) =>
        c.id === chapterId ? { ...c, scenes: c.scenes.map((sc) => sc.id === sceneId ? { ...sc, title } : sc) } : c
      ),
    }));
  }

  return (
    <div className="flex h-full flex-col glass border-r border-hairline">
      <div className="px-4 py-4 border-b border-hairline">
        <Link
          to="/historia/$storyId/biblia"
          params={{ storyId: story.id }}
          className="flex items-center gap-2 text-sm text-mint hover:text-neon transition-colors"
        >
          <Map className="h-4 w-4" />
          Sala de Guerra
        </Link>
        <div className="text-[10px] text-ink-muted mt-1 ml-6">Biblia · mundo · personajes</div>
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-3">
        <div className="px-2 mb-2 text-[10px] uppercase tracking-[0.2em] text-ink-muted">Capítulos</div>

        {story.chapters.map((ch) => {
          const open = openChapters[ch.id];
          const chWords = ch.scenes.reduce((a, s) => a + wordCount(s.content), 0);
          return (
            <div key={ch.id} className="mb-1">
              <div className="flex items-center group">
                <button onClick={() => toggle(ch.id)} className="p-1 text-ink-muted hover:text-mint">
                  {open ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                </button>
                <input
                  value={ch.title}
                  onChange={(e) => renameChapter(ch.id, e.target.value)}
                  className="flex-1 bg-transparent px-1 py-1 text-sm font-medium text-ink outline-none rounded hover:bg-accent/40 focus:bg-accent/60"
                />
                <span className="text-[10px] text-ink-muted px-1">{chWords}</span>
              </div>

              {open && (
                <div className="ml-5 mt-0.5 space-y-0.5">
                  {ch.scenes.map((sc) => {
                    const active = sc.id === activeSceneId;
                    return (
                      <div
                        key={sc.id}
                        className={`flex items-center rounded-lg px-2 py-1.5 text-sm cursor-pointer transition-all ${
                          active
                            ? "bg-accent text-ink border-l-2 border-emerald shadow-glow-sm"
                            : "text-ink-muted hover:bg-accent/40 hover:text-ink border-l-2 border-transparent"
                        }`}
                        onClick={() => onSelectScene(sc.id)}
                      >
                        <input
                          value={sc.title}
                          onChange={(e) => renameScene(ch.id, sc.id, e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                          className="flex-1 min-w-0 bg-transparent outline-none truncate"
                        />
                        <span className="text-[10px] text-ink-muted ml-2">{wordCount(sc.content)}</span>
                      </div>
                    );
                  })}
                  <button
                    onClick={() => addScene(ch.id)}
                    className="flex items-center gap-1 ml-2 px-2 py-1 text-xs text-ink-muted hover:text-mint"
                  >
                    <Plus className="h-3 w-3" /> Escena
                  </button>
                </div>
              )}
            </div>
          );
        })}

        <button
          onClick={addChapter}
          className="mt-3 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-ink-muted hover:bg-accent/40 hover:text-mint transition-colors"
        >
          <Plus className="h-4 w-4" /> Capítulo
        </button>
      </div>
    </div>
  );
}
