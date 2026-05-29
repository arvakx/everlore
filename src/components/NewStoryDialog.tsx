import { useState } from "react";
import { coverColors, createStory } from "@/lib/store";
import { X, Sparkles } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated: (id: string) => void;
}

export function NewStoryDialog({ open, onClose, onCreated }: Props) {
  const [title, setTitle] = useState("");
  const [logline, setLogline] = useState("");
  const [color, setColor] = useState(coverColors[0]);

  if (!open) return null;

  function create() {
    const s = createStory({ title, logline, coverColor: color });
    setTitle(""); setLogline(""); setColor(coverColors[0]);
    onCreated(s.id);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-fade-up">
      <div className="w-full max-w-md rounded-3xl glass-strong p-7 shadow-paper glow-border">
        <div className="flex items-start justify-between mb-5">
          <div>
            <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.25em] text-mint mb-1">
              <Sparkles className="h-3 w-3" /> Nuevo universo
            </div>
            <h2 className="font-serif text-2xl text-ink">Enciende tu historia</h2>
          </div>
          <button onClick={onClose} className="rounded-md p-1 text-ink-muted hover:bg-accent hover:text-ink">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4">
          <Field label="Título">
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Sin título" className={inputCls} />
          </Field>
          <Field label="¿De qué trata?">
            <textarea
              value={logline} onChange={(e) => setLogline(e.target.value)}
              placeholder="Una frase para que Lumi recuerde tu visión. Puedes dejarla en blanco."
              rows={3} className={inputCls + " resize-none"}
            />
          </Field>
          <Field label="Aura de la historia">
            <div className="flex flex-wrap gap-2">
              {coverColors.map((c) => (
                <button
                  key={c} type="button" onClick={() => setColor(c)}
                  className={`h-10 w-10 rounded-lg transition-all ${color === c ? "ring-2 ring-mint ring-offset-2 ring-offset-paper-elevated scale-110" : "hover:scale-105"}`}
                  style={{
                    background: `linear-gradient(135deg, ${c}, ${c}90)`,
                    boxShadow: color === c ? `0 0 16px ${c}` : `0 0 6px ${c}40`,
                  }}
                  aria-label={c}
                />
              ))}
            </div>
          </Field>
        </div>

        <div className="mt-7 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-lg px-4 py-2 text-sm text-ink-muted hover:text-ink">
            Cancelar
          </button>
          <button onClick={create} className="rounded-xl gradient-emerald px-5 py-2.5 text-sm font-medium text-primary-foreground hover:shadow-glow transition-all">
            Encender historia
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
