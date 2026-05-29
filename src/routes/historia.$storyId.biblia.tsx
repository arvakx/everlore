import { createFileRoute, useParams, Link, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { useStory, updateStory, newId, useApplyTheme } from "@/lib/store";

export const Route = createFileRoute("/historia/$storyId/biblia")({
  head: () => ({ meta: [{ title: "Biblia de la historia — Writedy" }] }),
  component: Bible,
});

type Tab = "personajes" | "lugares" | "hilos" | "tiempo" | "voz";

function Bible() {
  useApplyTheme();
  const { storyId } = useParams({ from: "/historia/$storyId/biblia" });
  const router = useRouter();
  const story = useStory(storyId);
  const [tab, setTab] = useState<Tab>("personajes");

  if (!story) return null;

  const tabs: { id: Tab; label: string }[] = [
    { id: "personajes", label: "Personajes" },
    { id: "lugares", label: "Lugares" },
    { id: "hilos", label: "Hilos de trama" },
    { id: "tiempo", label: "Línea de tiempo" },
    { id: "voz", label: "Voz y tono" },
  ];

  return (
    <div className="min-h-screen bg-paper">
      <div className="border-b border-hairline bg-paper">
        <div className="mx-auto max-w-5xl px-6 py-4 flex items-center gap-3">
          <Link
            to="/historia/$storyId"
            params={{ storyId }}
            className="rounded-md p-1.5 text-ink-muted hover:bg-accent hover:text-ink"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="font-serif text-lg text-ink">Biblia de la historia</div>
          <div className="text-sm text-ink-muted">· «{story.title}»</div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-6 py-8">
        <div className="flex flex-wrap gap-1 border-b border-hairline mb-8">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-2.5 text-sm transition-colors -mb-px border-b-2 ${
                tab === t.id
                  ? "border-ember text-ink font-medium"
                  : "border-transparent text-ink-muted hover:text-ink"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === "personajes" && <Characters storyId={storyId} story={story} />}
        {tab === "lugares" && <Places storyId={storyId} story={story} />}
        {tab === "hilos" && <Threads storyId={storyId} story={story} />}
        {tab === "tiempo" && <Timeline storyId={storyId} story={story} />}
        {tab === "voz" && <Voice storyId={storyId} story={story} />}
      </div>
    </div>
  );
}

const inputCls = "w-full rounded-lg border border-hairline bg-paper px-3 py-2 text-sm text-ink placeholder:text-ink-muted/70 outline-none focus:border-ember focus:ring-2 focus:ring-ember/20 transition";
const textCls = inputCls + " resize-none";

function Card({ children, onDelete }: { children: React.ReactNode; onDelete: () => void }) {
  return (
    <div className="rounded-2xl border border-hairline bg-paper-elevated p-5 shadow-soft relative">
      <button onClick={onDelete} className="absolute top-3 right-3 p-1.5 rounded-md text-ink-muted/60 hover:text-destructive hover:bg-accent">
        <Trash2 className="h-3.5 w-3.5" />
      </button>
      {children}
    </div>
  );
}

function AddBtn({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-hairline bg-transparent px-4 py-2 text-sm text-ink-muted hover:border-ember hover:text-ember transition-colors"
    >
      <Plus className="h-4 w-4" /> {label}
    </button>
  );
}

function Characters({ storyId, story }: { storyId: string; story: ReturnType<typeof useStory> & {} }) {
  function add() {
    updateStory(storyId, (s) => ({
      ...s,
      bible: { ...s.bible, characters: [...s.bible.characters, { id: newId(), name: "Sin nombre", role: "", description: "", traits: "", goals: "", notes: "" }] },
    }));
  }
  function patch(id: string, p: Partial<typeof story.bible.characters[number]>) {
    updateStory(storyId, (s) => ({ ...s, bible: { ...s.bible, characters: s.bible.characters.map(c => c.id === id ? { ...c, ...p } : c) } }));
  }
  function remove(id: string) {
    updateStory(storyId, (s) => ({ ...s, bible: { ...s.bible, characters: s.bible.characters.filter(c => c.id !== id) } }));
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        {story.bible.characters.map((c) => (
          <Card key={c.id} onDelete={() => remove(c.id)}>
            <div className="space-y-3">
              <input value={c.name} onChange={(e) => patch(c.id, { name: e.target.value })} className={inputCls + " font-serif text-lg"} placeholder="Nombre" />
              <input value={c.role} onChange={(e) => patch(c.id, { role: e.target.value })} className={inputCls} placeholder="Rol (protagonista, antagonista…)" />
              <textarea value={c.description} onChange={(e) => patch(c.id, { description: e.target.value })} rows={2} className={textCls} placeholder="Descripción" />
              <textarea value={c.traits} onChange={(e) => patch(c.id, { traits: e.target.value })} rows={2} className={textCls} placeholder="Rasgos" />
              <textarea value={c.goals} onChange={(e) => patch(c.id, { goals: e.target.value })} rows={2} className={textCls} placeholder="Objetivos / motivación" />
              <textarea value={c.notes} onChange={(e) => patch(c.id, { notes: e.target.value })} rows={2} className={textCls} placeholder="Notas" />
            </div>
          </Card>
        ))}
      </div>
      <AddBtn label="+ Personaje" onClick={add} />
    </div>
  );
}

function Places({ storyId, story }: { storyId: string; story: ReturnType<typeof useStory> & {} }) {
  function add() {
    updateStory(storyId, (s) => ({ ...s, bible: { ...s.bible, places: [...s.bible.places, { id: newId(), name: "Sin nombre", description: "" }] } }));
  }
  function patch(id: string, p: Partial<typeof story.bible.places[number]>) {
    updateStory(storyId, (s) => ({ ...s, bible: { ...s.bible, places: s.bible.places.map(c => c.id === id ? { ...c, ...p } : c) } }));
  }
  function remove(id: string) {
    updateStory(storyId, (s) => ({ ...s, bible: { ...s.bible, places: s.bible.places.filter(c => c.id !== id) } }));
  }
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        {story.bible.places.map((p) => (
          <Card key={p.id} onDelete={() => remove(p.id)}>
            <div className="space-y-3">
              <input value={p.name} onChange={(e) => patch(p.id, { name: e.target.value })} className={inputCls + " font-serif text-lg"} placeholder="Nombre del lugar" />
              <textarea value={p.description} onChange={(e) => patch(p.id, { description: e.target.value })} rows={4} className={textCls} placeholder="Descripción y atmósfera" />
            </div>
          </Card>
        ))}
      </div>
      <AddBtn label="+ Lugar" onClick={add} />
    </div>
  );
}

function Threads({ storyId, story }: { storyId: string; story: ReturnType<typeof useStory> & {} }) {
  function add() {
    updateStory(storyId, (s) => ({ ...s, bible: { ...s.bible, plotThreads: [...s.bible.plotThreads, { id: newId(), title: "Nuevo hilo", status: "abierto", notes: "" }] } }));
  }
  function patch(id: string, p: Partial<typeof story.bible.plotThreads[number]>) {
    updateStory(storyId, (s) => ({ ...s, bible: { ...s.bible, plotThreads: s.bible.plotThreads.map(c => c.id === id ? { ...c, ...p } : c) } }));
  }
  function remove(id: string) {
    updateStory(storyId, (s) => ({ ...s, bible: { ...s.bible, plotThreads: s.bible.plotThreads.filter(c => c.id !== id) } }));
  }
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        {story.bible.plotThreads.map((t) => (
          <Card key={t.id} onDelete={() => remove(t.id)}>
            <div className="space-y-3">
              <input value={t.title} onChange={(e) => patch(t.id, { title: e.target.value })} className={inputCls + " font-serif text-lg"} placeholder="Título del hilo" />
              <select
                value={t.status}
                onChange={(e) => patch(t.id, { status: e.target.value as typeof t.status })}
                className={inputCls}
              >
                <option value="abierto">Abierto</option>
                <option value="en_desarrollo">En desarrollo</option>
                <option value="resuelto">Resuelto</option>
              </select>
              <textarea value={t.notes} onChange={(e) => patch(t.id, { notes: e.target.value })} rows={3} className={textCls} placeholder="Notas" />
            </div>
          </Card>
        ))}
      </div>
      <AddBtn label="+ Hilo de trama" onClick={add} />
    </div>
  );
}

function Timeline({ storyId, story }: { storyId: string; story: ReturnType<typeof useStory> & {} }) {
  function add() {
    updateStory(storyId, (s) => ({ ...s, bible: { ...s.bible, timeline: [...s.bible.timeline, { id: newId(), title: "Evento", notes: "" }] } }));
  }
  function patch(id: string, p: Partial<typeof story.bible.timeline[number]>) {
    updateStory(storyId, (s) => ({ ...s, bible: { ...s.bible, timeline: s.bible.timeline.map(c => c.id === id ? { ...c, ...p } : c) } }));
  }
  function remove(id: string) {
    updateStory(storyId, (s) => ({ ...s, bible: { ...s.bible, timeline: s.bible.timeline.filter(c => c.id !== id) } }));
  }
  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {story.bible.timeline.map((ev, i) => (
          <div key={ev.id} className="flex gap-4 items-start">
            <div className="flex flex-col items-center pt-3">
              <div className="h-2 w-2 rounded-full bg-ember" />
              {i < story.bible.timeline.length - 1 && <div className="w-px flex-1 bg-hairline mt-1 min-h-[40px]" />}
            </div>
            <div className="flex-1">
              <Card onDelete={() => remove(ev.id)}>
                <div className="space-y-3">
                  <input value={ev.title} onChange={(e) => patch(ev.id, { title: e.target.value })} className={inputCls + " font-serif"} placeholder="Evento" />
                  <textarea value={ev.notes} onChange={(e) => patch(ev.id, { notes: e.target.value })} rows={2} className={textCls} placeholder="Notas" />
                </div>
              </Card>
            </div>
          </div>
        ))}
      </div>
      <AddBtn label="+ Evento" onClick={add} />
    </div>
  );
}

function Voice({ storyId, story }: { storyId: string; story: ReturnType<typeof useStory> & {} }) {
  return (
    <div className="max-w-2xl">
      <p className="text-sm text-ink-muted mb-3">
        Describe el tono, la voz narrativa y el punto de vista. El asistente respetará estas indicaciones.
      </p>
      <textarea
        value={story.bible.voice}
        onChange={(e) => updateStory(storyId, (s) => ({ ...s, bible: { ...s.bible, voice: e.target.value } }))}
        rows={10}
        className={textCls}
        placeholder="Por ejemplo: tercera persona limitada, tono melancólico pero esperanzado, frases cortas y muy visuales…"
      />
    </div>
  );
}
