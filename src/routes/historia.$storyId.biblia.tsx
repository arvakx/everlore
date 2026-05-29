import { createFileRoute, useParams, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Plus, Trash2, Users, MapPin, GitBranch, Clock, Mic, Sparkles } from "lucide-react";
import { useStory, updateStory, newId, useApplyTheme } from "@/lib/store";
import { Particles } from "@/components/Particles";

export const Route = createFileRoute("/historia/$storyId/biblia")({
  head: () => ({ meta: [{ title: "Sala de Guerra — Everlore" }] }),
  component: Bible,
});

type Tab = "personajes" | "lugares" | "hilos" | "tiempo" | "voz";

function Bible() {
  useApplyTheme();
  const { storyId } = useParams({ from: "/historia/$storyId/biblia" });
  const story = useStory(storyId);
  const [tab, setTab] = useState<Tab>("personajes");

  if (!story) return null;

  const tabs: { id: Tab; label: string; icon: React.ReactNode; count: number }[] = [
    { id: "personajes", label: "Personajes",      icon: <Users className="h-3.5 w-3.5" />,    count: story.bible.characters.length },
    { id: "lugares",    label: "Lugares",         icon: <MapPin className="h-3.5 w-3.5" />,   count: story.bible.places.length },
    { id: "hilos",      label: "Hilos de trama",  icon: <GitBranch className="h-3.5 w-3.5" />, count: story.bible.plotThreads.length },
    { id: "tiempo",     label: "Línea del tiempo", icon: <Clock className="h-3.5 w-3.5" />,    count: story.bible.timeline.length },
    { id: "voz",        label: "Voz y tono",      icon: <Mic className="h-3.5 w-3.5" />,      count: story.bible.voice ? 1 : 0 },
  ];

  return (
    <div className="relative min-h-screen bg-ambient">
      <Particles count={14} />
      <div className="relative border-b border-hairline glass">
        <div className="mx-auto max-w-6xl px-6 py-4 flex items-center gap-3">
          <Link
            to="/historia/$storyId" params={{ storyId }}
            className="rounded-md p-1.5 text-ink-muted hover:bg-accent hover:text-mint"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.25em] text-mint">
            <Sparkles className="h-3 w-3" /> Sala de Guerra
          </div>
          <div className="font-serif text-xl text-ink ml-2">Biblia de «{story.title}»</div>
        </div>
      </div>

      <div className="relative mx-auto max-w-6xl px-6 py-10">
        <header className="mb-8 animate-fade-up">
          <h1 className="font-serif text-3xl md:text-4xl text-ink">El mapa mental de tu universo</h1>
          <p className="mt-2 text-ink-muted">Personajes, lugares, hilos y memoria. Lumi consulta todo esto contigo.</p>
        </header>

        <div className="flex flex-wrap gap-1.5 mb-8 p-1.5 glass rounded-2xl w-fit">
          {tabs.map((t) => (
            <button
              key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-3.5 py-2 text-xs rounded-xl transition-all ${
                tab === t.id
                  ? "gradient-emerald text-primary-foreground shadow-glow"
                  : "text-ink-muted hover:text-ink hover:bg-accent/40"
              }`}
            >
              {t.icon}
              <span>{t.label}</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${tab === t.id ? "bg-black/20" : "bg-hairline/50"}`}>{t.count}</span>
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

const inputCls = "w-full rounded-xl border border-hairline bg-paper/60 px-3 py-2 text-sm text-ink placeholder:text-ink-muted/60 outline-none focus:border-emerald focus:ring-2 focus:ring-emerald/20 transition";
const textCls = inputCls + " resize-none";

function Card({ children, onDelete }: { children: React.ReactNode; onDelete: () => void }) {
  return (
    <div className="rounded-2xl glass p-5 relative hover:glow-ring hover:border-emerald/40 transition-all animate-fade-up">
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
      className="inline-flex items-center gap-1.5 rounded-xl border border-dashed border-hairline bg-transparent px-4 py-2.5 text-sm text-ink-muted hover:border-emerald hover:text-mint transition-all"
    >
      <Plus className="h-4 w-4" /> {label}
    </button>
  );
}

function Characters({ storyId, story }: { storyId: string; story: NonNullable<ReturnType<typeof useStory>> }) {
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
      <AddBtn label="Nuevo personaje" onClick={add} />
    </div>
  );
}

function Places({ storyId, story }: { storyId: string; story: NonNullable<ReturnType<typeof useStory>> }) {
  function add() { updateStory(storyId, (s) => ({ ...s, bible: { ...s.bible, places: [...s.bible.places, { id: newId(), name: "Sin nombre", description: "" }] } })); }
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
              <textarea value={p.description} onChange={(e) => patch(p.id, { description: e.target.value })} rows={4} className={textCls} placeholder="Atmósfera, geografía, historia…" />
            </div>
          </Card>
        ))}
      </div>
      <AddBtn label="Nuevo lugar" onClick={add} />
    </div>
  );
}

function Threads({ storyId, story }: { storyId: string; story: NonNullable<ReturnType<typeof useStory>> }) {
  function add() { updateStory(storyId, (s) => ({ ...s, bible: { ...s.bible, plotThreads: [...s.bible.plotThreads, { id: newId(), title: "Nuevo hilo", status: "abierto", notes: "" }] } })); }
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
      <AddBtn label="Nuevo hilo de trama" onClick={add} />
    </div>
  );
}

function Timeline({ storyId, story }: { storyId: string; story: NonNullable<ReturnType<typeof useStory>> }) {
  function add() { updateStory(storyId, (s) => ({ ...s, bible: { ...s.bible, timeline: [...s.bible.timeline, { id: newId(), title: "Evento", notes: "" }] } })); }
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
            <div className="flex flex-col items-center pt-4">
              <div className="h-3 w-3 rounded-full gradient-emerald glow-ring" />
              {i < story.bible.timeline.length - 1 && <div className="w-px flex-1 bg-hairline mt-1 min-h-[60px]" />}
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
      <AddBtn label="Nuevo evento" onClick={add} />
    </div>
  );
}

function Voice({ storyId, story }: { storyId: string; story: NonNullable<ReturnType<typeof useStory>> }) {
  return (
    <div className="max-w-2xl rounded-2xl glass p-6 glow-border">
      <p className="text-sm text-ink-muted mb-3">
        Describe el tono, la voz narrativa y el punto de vista. Lumi y los especialistas respetarán estas indicaciones.
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
