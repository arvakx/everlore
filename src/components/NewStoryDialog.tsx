import { useMemo, useState } from "react";
import { createStory } from "@/lib/store";
import { AURA_GROUPS, ALL_AURAS, type Aura } from "@/lib/auras";
import { X, Sparkles, Wand2 } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated: (id: string) => void;
}

export function NewStoryDialog({ open, onClose, onCreated }: Props) {
  const [title, setTitle] = useState("");
  const [logline, setLogline] = useState("");
  const [groupId, setGroupId] = useState(AURA_GROUPS[0].id);
  const [auraId, setAuraId] = useState<string>(AURA_GROUPS[0].auras[0].id);

  const selected: Aura = useMemo(
    () => ALL_AURAS.find((a) => a.id === auraId) ?? AURA_GROUPS[0].auras[0],
    [auraId]
  );
  const group = AURA_GROUPS.find((g) => g.id === groupId) ?? AURA_GROUPS[0];

  if (!open) return null;

  function create() {
    const s = createStory({ title, logline, coverColor: selected.color });
    setTitle(""); setLogline("");
    onCreated(s.id);
  }

  function suggestAura() {
    const text = (title + " " + logline).toLowerCase();
    const map: Array<[RegExp, string]> = [
      [/oscur|terror|miedo|sombr|abism|muert/, "eclipse"],
      [/amor|romanc|coraz|beso|pasi/, "rose"],
      [/galax|espaci|estrella|cosmo|univer/, "galaxy"],
      [/fuego|guerr|batall|ira|sangre/, "crimson"],
      [/hielo|invierno|frio|nieve/, "frost"],
      [/magia|hechic|arcano|brujo|conjur/, "arcane"],
      [/bosq|natural|verde|arbol|hoja/, "forest"],
      [/epic|leyend|hero|destino|reino/, "gold"],
      [/melanc|triste|nostalg|recuerd/, "midnight"],
      [/cyber|futur|neon|digital|tecno/, "neon"],
    ];
    for (const [re, id] of map) {
      if (re.test(text)) {
        const a = ALL_AURAS.find((x) => x.id === id);
        if (a) {
          const g = AURA_GROUPS.find((gr) => gr.auras.some((x) => x.id === a.id));
          if (g) setGroupId(g.id);
          setAuraId(a.id);
          return;
        }
      }
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-fade-up" onClick={onClose}>
      <div className="w-full max-w-2xl rounded-3xl glass-strong p-7 shadow-paper glow-border max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
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
              rows={2} className={inputCls + " resize-none"}
            />
          </Field>

          {/* Aura preview card */}
          <div
            className="relative overflow-hidden rounded-2xl border border-hairline p-5"
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
                className="h-16 w-12 shrink-0 rounded-md"
                style={{
                  background: `linear-gradient(160deg, ${selected.color}, ${selected.accent ?? selected.color}80)`,
                  boxShadow: `0 0 32px ${selected.color}99`,
                }}
              />
              <div className="min-w-0">
                <div className="text-[10px] uppercase tracking-[0.2em] text-mint">Aura seleccionada</div>
                <div className="font-serif text-xl text-ink">{selected.name}</div>
                <div className="text-xs text-ink-muted italic mt-0.5">{selected.mood}</div>
              </div>
              <button
                type="button"
                onClick={suggestAura}
                className="ml-auto inline-flex items-center gap-1.5 rounded-lg border border-hairline bg-paper/40 px-3 py-1.5 text-xs text-ink hover:border-emerald hover:text-mint transition"
                title="Lumi sugiere un aura según tu título"
              >
                <Wand2 className="h-3.5 w-3.5" /> Sugerir
              </button>
            </div>
          </div>

          <Field label="Aura de la historia">
            {/* Group tabs */}
            <div className="flex flex-wrap gap-1.5 mb-3">
              {AURA_GROUPS.map((g) => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => setGroupId(g.id)}
                  className={`rounded-full px-3 py-1 text-[11px] transition ${
                    g.id === groupId
                      ? "bg-accent text-mint border border-emerald"
                      : "border border-hairline text-ink-muted hover:text-ink hover:border-emerald/60"
                  }`}
                >
                  {g.label}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-6 gap-2.5">
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
                    {active && (
                      <span className="absolute inset-0 rounded-lg animate-pulse opacity-40" style={{ boxShadow: `inset 0 0 20px ${a.color}` }} />
                    )}
                  </button>
                );
              })}
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
