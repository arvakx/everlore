import { useEffect, useState } from "react";
import { X, Trash2, Settings as SettingsIcon } from "lucide-react";
import { type Story, updateStory, deleteStory, coverColors } from "@/lib/store";
import { ExportMenu } from "@/components/ExportMenu";

interface Props {
  story: Story | null;
  onClose: () => void;
  onDeleted?: () => void;
}

export function StorySettingsDialog({ story, onClose, onDeleted }: Props) {
  const [title, setTitle] = useState("");
  const [logline, setLogline] = useState("");
  const [color, setColor] = useState(coverColors[0]);
  const [voice, setVoice] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (story) {
      setTitle(story.title);
      setLogline(story.logline);
      setColor(story.coverColor);
      setVoice(story.bible.voice);
      setConfirmDelete(false);
    }
  }, [story?.id]);

  if (!story) return null;

  function save() {
    updateStory(story!.id, (s) => ({
      ...s,
      title: title.trim() || "Sin título",
      logline,
      coverColor: color,
      bible: { ...s.bible, voice },
    }));
    onClose();
  }

  function remove() {
    deleteStory(story!.id);
    onClose();
    onDeleted?.();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-fade-up" onClick={onClose}>
      <div className="w-full max-w-lg rounded-3xl glass-strong p-7 shadow-paper glow-border" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between mb-5">
          <div>
            <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.25em] text-mint mb-1">
              <SettingsIcon className="h-3 w-3" /> Configuración
            </div>
            <h2 className="font-serif text-2xl text-ink">Ajustes de la historia</h2>
          </div>
          <button onClick={onClose} className="rounded-md p-1 text-ink-muted hover:bg-accent hover:text-ink">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
          <Field label="Título">
            <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputCls} />
          </Field>
          <Field label="Sinopsis breve">
            <textarea value={logline} onChange={(e) => setLogline(e.target.value)} rows={3} className={inputCls + " resize-none"} />
          </Field>
          <Field label="Voz narrativa">
            <textarea
              value={voice}
              onChange={(e) => setVoice(e.target.value)}
              rows={3}
              placeholder="Tercera persona limitada, tono melancólico…"
              className={inputCls + " resize-none"}
            />
          </Field>
          <Field label="Aura de la historia">
            <div className="flex flex-wrap gap-2">
              {coverColors.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`h-10 w-10 rounded-lg transition-all ${color === c ? "ring-2 ring-mint ring-offset-2 ring-offset-paper-elevated scale-110" : "hover:scale-105"}`}
                  style={{
                    background: `linear-gradient(135deg, ${c}, ${c}90)`,
                    boxShadow: color === c ? `0 0 16px ${c}` : `0 0 6px ${c}40`,
                  }}
                />
              ))}
            </div>
          </Field>

          <div className="pt-2 border-t border-hairline/60">
            <div className="mb-2 text-[11px] uppercase tracking-[0.15em] text-ink-muted">Exportar manuscrito</div>
            <ExportMenu align="left" />
          </div>

          <div className="pt-2 border-t border-hairline/60">
            <div className="mb-2 text-[11px] uppercase tracking-[0.15em] text-ink-muted">Zona peligrosa</div>
            {confirmDelete ? (
              <div className="rounded-xl border border-destructive/50 bg-destructive/10 p-3">
                <div className="text-sm text-ink mb-2">¿Borrar “{story.title}” para siempre?</div>
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
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-lg px-4 py-2 text-sm text-ink-muted hover:text-ink">Cancelar</button>
          <button onClick={save} className="rounded-xl gradient-emerald px-5 py-2.5 text-sm font-medium text-primary-foreground hover:shadow-glow transition-all">
            Guardar cambios
          </button>
        </div>
      </div>
    </div>
  );
}

const inputCls =
  "w-full rounded-xl border border-hairline bg-paper/60 px-4 py-2.5 text-sm text-ink placeholder:text-ink-muted/60 outline-none focus:border-emerald focus:ring-2 focus:ring-emerald/30 transition";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] uppercase tracking-[0.15em] text-ink-muted">{label}</span>
      {children}
    </label>
  );
}
