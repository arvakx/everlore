import { useState } from "react";
import { coverColors, createStory } from "@/lib/store";
import { X } from "lucide-react";

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/30 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl border border-hairline bg-paper-elevated p-6 shadow-paper">
        <div className="flex items-start justify-between mb-4">
          <h2 className="font-serif text-xl text-ink">Nueva historia</h2>
          <button onClick={onClose} className="rounded-md p-1 text-ink-muted hover:bg-accent hover:text-ink">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4">
          <Field label="Título de la historia">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Sin título"
              className={inputCls}
            />
          </Field>
          <Field label="¿De qué trata?">
            <textarea
              value={logline}
              onChange={(e) => setLogline(e.target.value)}
              placeholder="Una frase para recordarte de qué va. Puedes dejarla en blanco."
              rows={3}
              className={inputCls + " resize-none"}
            />
          </Field>
          <Field label="Color de portada">
            <div className="flex flex-wrap gap-2">
              {coverColors.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`h-8 w-8 rounded-md transition-transform ${color === c ? "ring-2 ring-ember ring-offset-2 ring-offset-paper-elevated scale-110" : ""}`}
                  style={{ background: c }}
                  aria-label={c}
                />
              ))}
            </div>
          </Field>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-lg px-4 py-2 text-sm text-ink-muted hover:text-ink">
            Cancelar
          </button>
          <button onClick={create} className="rounded-lg bg-ember px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-ember-hover">
            Crear
          </button>
        </div>
      </div>
    </div>
  );
}

const inputCls =
  "w-full rounded-lg border border-hairline bg-paper px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-muted/70 outline-none focus:border-ember focus:ring-2 focus:ring-ember/20 transition";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-ink-muted">{label}</span>
      {children}
    </label>
  );
}
