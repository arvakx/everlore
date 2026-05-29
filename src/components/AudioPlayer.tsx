import { useEffect, useState } from "react";
import {
  Play, Pause, Volume2, VolumeX, Music, X, Save, Trash2, Sparkles,
  Bookmark, Disc3, Waves,
} from "lucide-react";
import {
  MUSIC_CATEGORIES, LAYERS, useAudioState,
  playCategory, stopMusic, togglePlay, setLayer, setLayerVolume,
  setMasterVolume, setMusicVolume, setLayersVolume,
  applyPreset, savePreset, deletePreset, stopAll,
  type MusicCategoryId,
} from "@/lib/audio";

interface Props {
  variant?: "mini" | "panel";
  open?: boolean;
  onClose?: () => void;
}

export function AudioPlayer({ variant = "mini", open, onClose }: Props) {
  const state = useAudioState();
  const [panelOpen, setPanelOpen] = useState(false);

  useEffect(() => {
    if (open !== undefined) setPanelOpen(open);
  }, [open]);

  const currentCat = MUSIC_CATEGORIES.find((c) => c.id === state.category);
  const activeLayerCount = Object.values(state.layers).filter((l) => l?.enabled).length;

  if (variant === "mini") {
    return (
      <>
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
          <div className="pointer-events-auto inline-flex items-center gap-2 rounded-full glass-strong border border-hairline px-2 py-1.5 shadow-paper">
            <button
              onClick={() => togglePlay()}
              className="relative inline-flex h-9 w-9 items-center justify-center rounded-full gradient-emerald text-primary-foreground hover:shadow-glow transition active:scale-95"
              aria-label={state.playing ? "Pausar" : "Reproducir"}
            >
              {state.playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 translate-x-px" />}
              {state.playing && (
                <span className="absolute inset-0 rounded-full lumi-halo"
                  style={{ background: `radial-gradient(circle, hsl(${currentCat?.hue ?? 150} 70% 55% / 0.4), transparent 70%)`, filter: "blur(6px)" }} />
              )}
            </button>
            <button
              onClick={() => setPanelOpen(true)}
              className="flex items-center gap-2 px-2 py-1 rounded-full hover:bg-accent transition text-left max-w-[220px]"
            >
              <div className="relative shrink-0">
                <Disc3 className={`h-4 w-4 text-mint ${state.playing ? "animate-spin" : ""}`} style={{ animationDuration: "8s" }} />
              </div>
              <div className="min-w-0">
                <div className="text-xs text-ink truncate leading-tight">
                  {currentCat?.name ?? "Atmósfera apagada"}
                </div>
                <div className="text-[9px] uppercase tracking-widest text-ink-muted leading-tight">
                  {activeLayerCount > 0 ? `${activeLayerCount} capa${activeLayerCount > 1 ? "s" : ""}` : "Elige una atmósfera"}
                </div>
              </div>
            </button>
            <div className="flex items-center gap-1.5 pr-2 pl-1 border-l border-hairline/70">
              {state.masterVolume === 0 ? <VolumeX className="h-3.5 w-3.5 text-ink-muted" /> : <Volume2 className="h-3.5 w-3.5 text-ink-muted" />}
              <input
                type="range" min={0} max={1} step={0.01} value={state.masterVolume}
                onChange={(e) => setMasterVolume(Number(e.target.value))}
                className="w-20 accent-emerald cursor-pointer"
                aria-label="Volumen"
              />
            </div>
          </div>
        </div>

        {panelOpen && <AudioPanel onClose={() => { setPanelOpen(false); onClose?.(); }} />}
      </>
    );
  }

  return panelOpen ? <AudioPanel onClose={() => { setPanelOpen(false); onClose?.(); }} /> : null;
}

function AudioPanel({ onClose }: { onClose: () => void }) {
  const state = useAudioState();
  const [tab, setTab] = useState<"musica" | "ambiente" | "presets">("musica");
  const [presetName, setPresetName] = useState("");

  const cat = MUSIC_CATEGORIES.find((c) => c.id === state.category);

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/60 backdrop-blur-md p-3 md:p-4 animate-fade-up" onClick={onClose}>
      <div
        className="w-full max-w-3xl rounded-3xl glass-strong border border-hairline shadow-paper glow-border overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="relative px-6 py-5 border-b border-hairline/60 overflow-hidden"
          style={{
            background: `linear-gradient(135deg, hsl(${cat?.hue ?? 150} 60% 35% / 0.4), transparent 70%), var(--color-paper-elevated)`,
          }}
        >
          <div className="absolute -top-20 -right-20 h-60 w-60 rounded-full blur-3xl opacity-40"
            style={{ background: `hsl(${cat?.hue ?? 150} 80% 55% / 0.6)` }} />
          <div className="relative flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative shrink-0">
                <div className="flex h-12 w-12 items-center justify-center rounded-full gradient-emerald glow-ring">
                  <Music className="h-5 w-5 text-primary-foreground" />
                </div>
                {state.playing && <span className="absolute -inset-1 rounded-full lumi-halo opacity-60" style={{ background: `radial-gradient(circle, hsl(${cat?.hue ?? 150} 70% 55% / 0.6), transparent 70%)`, filter: "blur(10px)" }} />}
              </div>
              <div className="min-w-0">
                <div className="text-[10px] uppercase tracking-[0.25em] text-mint">Atmósfera</div>
                <div className="font-serif text-2xl text-ink leading-tight truncate">
                  {cat?.name ?? "Silencio"}
                </div>
                <div className="text-xs text-ink-muted italic mt-0.5">
                  {cat?.mood ?? "Elige una atmósfera para empezar"}
                </div>
              </div>
            </div>
            <button onClick={onClose} className="rounded-md p-1.5 text-ink-muted hover:bg-accent hover:text-ink shrink-0" aria-label="Cerrar">
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Animated waveform-ish */}
          <div className="relative mt-4 flex items-end gap-0.5 h-6">
            {Array.from({ length: 56 }).map((_, i) => (
              <span
                key={i}
                className="flex-1 rounded-full transition-all"
                style={{
                  height: state.playing
                    ? `${20 + Math.abs(Math.sin((i / 4) + Date.now() / 1000)) * 80}%`
                    : "10%",
                  background: `linear-gradient(180deg, hsl(${cat?.hue ?? 150} 70% 65%), hsl(${cat?.hue ?? 150} 70% 35%))`,
                  opacity: state.playing ? 0.85 : 0.3,
                  animation: state.playing ? `wave-bar ${1.5 + (i % 5) * 0.2}s ease-in-out infinite alternate` : undefined,
                }}
              />
            ))}
          </div>
        </div>

        {/* Master controls */}
        <div className="grid grid-cols-3 gap-3 px-6 py-4 border-b border-hairline/60 bg-paper/40">
          <VolKnob label="General"   value={state.masterVolume} onChange={setMasterVolume} />
          <VolKnob label="Música"    value={state.musicVolume}  onChange={setMusicVolume} />
          <VolKnob label="Ambiente"  value={state.layersVolume} onChange={setLayersVolume} />
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-hairline px-4">
          {([
            ["musica",   "Atmósferas",  Music],
            ["ambiente", "Mezclador",   Waves],
            ["presets",  "Mis ambientes", Bookmark],
          ] as const).map(([id, label, Icon]) => (
            <button
              key={id} onClick={() => setTab(id)}
              className={`relative inline-flex items-center gap-1.5 px-3 py-2.5 text-sm transition ${
                tab === id ? "text-mint" : "text-ink-muted hover:text-ink"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
              {tab === id && <span className="absolute bottom-[-1px] left-0 right-0 h-0.5 gradient-emerald rounded-full" />}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 md:p-5">
          {tab === "musica" && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
              {MUSIC_CATEGORIES.map((c) => {
                const active = state.category === c.id && state.playing;
                return (
                  <button
                    key={c.id}
                    onClick={() => active ? stopMusic() : playCategory(c.id)}
                    className={`group relative text-left rounded-2xl border p-3.5 overflow-hidden transition-all hover:-translate-y-0.5 ${
                      active ? "border-emerald glow-border" : "border-hairline bg-paper-elevated/60 hover:border-emerald/50"
                    }`}
                    style={{
                      background: active
                        ? `linear-gradient(135deg, hsl(${c.hue} 55% 25% / 0.6), var(--color-paper-elevated))`
                        : undefined,
                    }}
                  >
                    <div className="absolute -top-10 -right-10 h-24 w-24 rounded-full blur-2xl opacity-40 group-hover:opacity-70 transition"
                      style={{ background: `hsl(${c.hue} 70% 55% / 0.6)` }} />
                    <div className="relative">
                      <div className="flex items-center gap-2 mb-1.5">
                        <div className={`flex h-7 w-7 items-center justify-center rounded-full ${active ? "gradient-emerald" : "bg-paper/60"}`}
                          style={!active ? { boxShadow: `0 0 12px hsl(${c.hue} 70% 55% / 0.5)` } : undefined}>
                          {active ? <Pause className="h-3 w-3 text-primary-foreground" /> : <Play className="h-3 w-3 text-mint translate-x-px" />}
                        </div>
                        {active && (
                          <span className="text-[9px] uppercase tracking-widest text-mint">Sonando</span>
                        )}
                      </div>
                      <div className="font-serif text-sm text-ink leading-tight">{c.name}</div>
                      <div className="text-[10px] text-ink-muted italic mt-0.5 truncate">{c.mood}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {tab === "ambiente" && (
            <div className="space-y-2">
              <p className="text-xs text-ink-muted italic mb-2">
                Combina capas de sonido para crear tu propio ambiente.
              </p>
              {LAYERS.map((l) => {
                const st = state.layers[l.id] ?? { enabled: false, volume: 0.5 };
                return (
                  <div key={l.id} className={`rounded-xl border p-3 transition ${st.enabled ? "border-emerald/50 bg-emerald/5" : "border-hairline bg-paper-elevated/50"}`}>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setLayer(l.id, !st.enabled, st.volume)}
                        className={`inline-flex h-8 w-8 items-center justify-center rounded-full transition shrink-0 ${
                          st.enabled ? "gradient-emerald text-primary-foreground glow-ring" : "border border-hairline text-ink-muted hover:text-mint hover:border-emerald"
                        }`}
                        aria-label={st.enabled ? "Apagar" : "Encender"}
                      >
                        {st.enabled ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5 translate-x-px" />}
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-ink leading-tight">{l.name}</div>
                        <div className="text-[10px] text-ink-muted">{l.description}</div>
                      </div>
                      <input
                        type="range" min={0} max={1} step={0.01} value={st.volume}
                        onChange={(e) => setLayerVolume(l.id, Number(e.target.value))}
                        disabled={!st.enabled}
                        className="w-28 md:w-40 accent-emerald disabled:opacity-30 cursor-pointer"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {tab === "presets" && (
            <div className="space-y-3">
              <div className="rounded-xl border border-emerald/40 bg-paper-elevated/60 p-3 glow-border">
                <div className="text-[10px] uppercase tracking-widest text-mint mb-2">Guardar mezcla actual</div>
                <div className="flex gap-2">
                  <input
                    value={presetName}
                    onChange={(e) => setPresetName(e.target.value)}
                    placeholder="Mi rincón de escritura…"
                    className="flex-1 rounded-lg border border-hairline bg-paper px-3 py-2 text-sm text-ink placeholder:text-ink-muted/60 outline-none focus:border-emerald"
                  />
                  <button
                    onClick={() => { if (presetName.trim()) { savePreset(presetName); setPresetName(""); } }}
                    className="inline-flex items-center gap-1.5 rounded-lg gradient-emerald px-3 py-2 text-sm font-medium text-primary-foreground hover:shadow-glow"
                  >
                    <Save className="h-3.5 w-3.5" /> Guardar
                  </button>
                </div>
              </div>

              {state.presets.length === 0 ? (
                <div className="text-center py-8 text-sm text-ink-muted italic">
                  Aún no tienes ambientes guardados.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {state.presets.map((p) => {
                    const c = MUSIC_CATEGORIES.find((x) => x.id === p.category);
                    const lc = Object.values(p.layers).filter((l) => l?.enabled).length;
                    return (
                      <div key={p.id} className="group rounded-xl glass border border-hairline p-3 hover:border-emerald/50 transition relative"
                        style={c ? { background: `linear-gradient(135deg, hsl(${c.hue} 50% 22% / 0.4), var(--color-paper-elevated))` } : undefined}>
                        <button onClick={() => applyPreset(p)} className="text-left w-full">
                          <div className="flex items-center gap-2">
                            <Bookmark className="h-3.5 w-3.5 text-mint" />
                            <div className="font-serif text-sm text-ink truncate flex-1">{p.name}</div>
                          </div>
                          <div className="mt-1 text-[11px] text-ink-muted truncate">
                            {c?.name ?? "Sin música"} · {lc} capa{lc !== 1 ? "s" : ""}
                          </div>
                        </button>
                        <button
                          onClick={() => deletePreset(p.id)}
                          className="absolute top-2 right-2 p-1 rounded text-ink-muted/60 opacity-0 group-hover:opacity-100 hover:text-destructive transition"
                          aria-label="Borrar"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-2 px-5 py-3 border-t border-hairline/60 bg-paper/40">
          <div className="text-[10px] text-ink-muted italic flex items-center gap-1.5">
            <Sparkles className="h-3 w-3 text-mint" /> Audio generado en tu dispositivo, sin streaming
          </div>
          <button
            onClick={() => stopAll()}
            className="text-xs text-ink-muted hover:text-destructive transition"
          >
            Silenciar todo
          </button>
        </div>
      </div>
    </div>
  );
}

function VolKnob({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div className="rounded-xl border border-hairline bg-paper-elevated/50 px-3 py-2">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] uppercase tracking-widest text-ink-muted">{label}</span>
        <span className="text-[10px] text-mint tabular-nums">{Math.round(value * 100)}</span>
      </div>
      <input
        type="range" min={0} max={1} step={0.01} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-emerald cursor-pointer"
      />
    </div>
  );
}
