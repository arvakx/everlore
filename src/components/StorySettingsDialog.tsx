import { useEffect, useMemo, useState } from "react";
import { X, Trash2, Settings as SettingsIcon, Sparkles, Check } from "lucide-react";
import { toast } from "sonner";
import { type Story, updateStory, deleteStory } from "@/lib/store";
import { AURA_GROUPS, ALL_AURAS, findAuraByColor, type Aura } from "@/lib/auras";
import { ExportMenu } from "@/components/ExportMenu";

interface Props {
  story: Story | null;
  onClose: () => void;
  onDeleted?: () => void;
}

export function StorySettingsDialog({ story, onClose, onDeleted }: Props) {
  const [title, setTitle] = useState("");
  const [logline, setLogline] = useState("");
  const [voice, setVoice] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [tab, setTab] = useState<"info" | "aura" | "exportar" | "peligro">("info");

  const initialAura = useMemo(
    () => (story ? findAuraByColor(story.coverColor) ?? AURA_GROUPS[0].auras[0] : AURA_GROUPS[0].auras[0]),
    [story?.id]
  );
  const [auraId, setAuraId] = useState<string>(initialAura.id);
  const [groupId, setGroupId] = useState<string>(
    AURA_GROUPS.find((g) => g.auras.some((a) => a.id === initialAura.id))?.id ?? AURA_GROUPS[0].id
  );

  const selected: Aura = useMemo(
    () => ALL_AURAS.find((a) => a.id === auraId) ?? AURA_GROUPS[0].auras[0],
    [auraId]
  );
  const group = AURA_GROUPS.find((g) => g.id === groupId) ?? AURA_GROUPS[0];

  useEffect(() => {
    if (story) {
      setTitle(story.title);
      setLogline(story.logline);
      setVoice(story.bible.voice);
      const a = findAuraByColor(story.coverColor) ?? AURA_GROUPS[0].auras[0];
      setAuraId(a.id);
      setGroupId(AURA_GROUPS.find((g) => g.auras.some((x) => x.id === a.id))?.id ?? AURA_GROUPS[0].id);
      setConfirmDelete(false);
      setTab("info");
    }
  }, [story?.id]);

  if (!story) return null;

  const auraChanged = selected.color.toLowerCase() !== story.coverColor.toLowerCase();

  function save() {
    updateStory(story!.id, (s) => ({
      ...s,
      title: title.trim() || "Sin título",
      logline,
      coverColor: selected.color,
      bible: { ...s.bible, voice },
    }));
    if (auraChanged) {
      toast("El alma visual de tu historia ha cambiado", {
        description: `Lumi siente la nueva esencia: ${selected.name.toLowerCase()} — ${selected.mood.toLowerCase()}.`,
        duration: 6000,
      });
    }
    onClose();
  }

  function remove() {
    deleteStory(story!.id);
    onClose();
    onDeleted?.();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-md sm:p-4 animate-fade-up" onClick={onClose}>
      <div
        className="w-full sm:max-w-2xl rounded-t-3xl sm:rounded-3xl glass-strong p-5 sm:p-7 shadow-paper glow-border max-h-[92vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.25em] text-mint mb-1">
              <SettingsIcon className="h-3 w-3" /> Configuración
            </div>
            <h2 className="font-serif text-xl sm:text-2xl text-ink">Ajustes de la historia</h2>
          </div>
          <button onClick={onClose} className="rounded-md p-1 text-ink-muted hover:bg-accent hover:text-ink">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 overflow-x-auto pb-1 mb-3 -mx-1 px-1">
          {[
            { id: "info", label: "Identidad" },
            { id: "aura", label: "Aura" },
            { id: "exportar", label: "Exportar" },
            { id: "peligro", label: "Avanzado" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id as typeof tab)}
              className={`shrink-0 rounded-full px-3 py-1.5 text-xs transition ${
                tab === t.id ? "bg-accent text-mint border border-emerald" : "border border-hairline text-ink-muted hover:text-ink"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto pr-1 space-y-4">
          {tab === "info" && (
            <>
              <Field label="Título">
                <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputCls} />
              </Field>
              <Field label="Sinopsis breve">
                <textarea value={logline} onChange={(e) => setLogline(e.target.value)} rows={3} className={inputCls + " resize-none"} />
              </Field>
              <Field label="Voz narrativa">
                <textarea
                  value={voice} onChange={(e) => setVoice(e.target.value)} rows={3}
                  placeholder="Tercera persona limitada, tono melancólico…"
                  className={inputCls + " resize-none"}
                />
              </Field>
            </>
          )}

          {tab === "aura" && (
            <div className="space-y-4 aura-transition">
              {/* Live preview */}
              <div
                className="relative overflow-hidden rounded-2xl border border-hairline p-5 aura-transition"
                style={{
                  background: `linear-gradient(135deg, ${selected.color}40, ${(selected.accent ?? selected.color)}15 60%, transparent)`,
                  boxShadow: `inset 0 0 60px ${selected.color}25, 0 0 24px ${selected.color}30`,
                }}
              >
                <div
                  className="absolute -top-20 -right-20 h-56 w-56 rounded-full blur-3xl opacity-50 lumi-pulse"
                  style={{ background: selected.color }}
                />
                <div className="relative flex items-center gap-4">
                  <div
                    className="h-16 w-12 shrink-0 rounded-md aura-transition"
                    style={{
                      background: `linear-gradient(160deg, ${selected.color}, ${selected.accent ?? selected.color}80)`,
                      boxShadow: `0 0 32px ${selected.color}99`,
                    }}
                  />
                  <div className="min-w-0">
                    <div className="text-[10px] uppercase tracking-[0.2em] text-mint flex items-center gap-1">
                      <Sparkles className="h-3 w-3" /> Vista previa en vivo
                    </div>
                    <div className="font-serif text-xl text-ink">{selected.name}</div>
                    <div className="text-xs text-ink-muted italic mt-0.5">{selected.mood}</div>
                  </div>
                </div>
              </div>

              {/* Groups */}
              <div className="flex flex-wrap gap-1.5">
                {AURA_GROUPS.map((g) => (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => setGroupId(g.id)}
                    className={`rounded-full px-3 py-1 text-[11px] transition ${
                      g.id === groupId ? "bg-accent text-mint border border-emerald" : "border border-hairline text-ink-muted hover:text-ink hover:border-emerald/60"
                    }`}
                  >
                    {g.label}
                  </button>
                ))}
              </div>

              {/* Swatches */}
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2.5">
                {group.auras.map((a) => {
                  const active = a.id === auraId;
                  return (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => setAuraId(a.id)}
                      title={`${a.name} — ${a.mood}`}
                      className={`relative h-12 rounded-lg transition-all ${active ? "ring-2 ring-mint ring-offset-2 ring-offset-paper-elevated scale-105" : "hover:scale-105"}`}
                      style={{
                        background: `linear-gradient(135deg, ${a.color}, ${(a.accent ?? a.color)}90)`,
                        boxShadow: active ? `0 0 20px ${a.color}` : `0 0 6px ${a.color}40`,
                      }}
                      aria-label={a.name}
                    >
                      {active && <Check className="absolute inset-0 m-auto h-4 w-4 text-white drop-shadow" />}
                    </button>
                  );
                })}
              </div>
              {auraChanged && (
                <div className="rounded-xl border border-emerald/40 bg-emerald/10 p-3 text-xs text-mint italic flex items-start gap-2">
                  <Sparkles className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                  Cambiarás la esencia visual de tu historia. Lumi adaptará el ambiente y sus sugerencias al nuevo aura.
                </div>
              )}
            </div>
          )}

          {tab === "exportar" && (
            <div>
              <div className="mb-2 text-[11px] uppercase tracking-[0.15em] text-ink-muted">Exportar manuscrito</div>
              <ExportMenu align="left" />
              <p className="mt-3 text-xs text-ink-muted italic">
                Disponible en PDF, EPUB, Kindle, Word, Markdown, HTML y TXT.
              </p>
            </div>
          )}

          {tab === "peligro" && (
            <div>
              <div className="mb-2 text-[11px] uppercase tracking-[0.15em] text-ink-muted">Zona peligrosa</div>
              {confirmDelete ? (
                <div className="rounded-xl border border-destructive/50 bg-destructive/10 p-3">
                  <div className="text-sm text-ink mb-2">¿Borrar "{story.title}" para siempre?</div>
                  <div className="flex gap-2">
                    <button onClick={remove} className="rounded-md bg-destructive px-3 py-1.5 text-xs text-destructive-foreground hover:opacity-90">
                      Sí, borrar
                    </button>
                    <button onClick={() => setConfirmDelete(false)} className="rounded-md border border-hairline px-3 py-1.5 text-xs text-ink-muted hover:text-ink">
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="inline-flex items-center gap-1.5 rounded-md border border-hairline px-3 py-1.5 text-xs text-ink-muted hover:border-destructive hover:text-destructive transition"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Borrar historia
                </button>
              )}
            </div>
          )}
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-lg px-4 py-2 text-sm text-ink-muted hover:text-ink">Cancelar</button>
          <button onClick={save} className="rounded-xl gradient-emerald px-5 py-2.5 text-sm font-medium text-primary-foreground hover:shadow-glow transition-all">
            {tab === "aura" && auraChanged ? "Aplicar aura" : "Guardar cambios"}
          </button>
        </div>
      </div>
    </div>
  );
}

const inputCls =
  "w-full rounded-xl border border-hairline bg-paper/60 px-4 py-2.5 text-base sm:text-sm text-ink placeholder:text-ink-muted/60 outline-none focus:border-emerald focus:ring-2 focus:ring-emerald/30 transition";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] uppercase tracking-[0.15em] text-ink-muted">{label}</span>
      {children}
    </label>
  );
}
