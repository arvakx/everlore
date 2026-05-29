import { X, Check, Sparkles, Crown, Feather } from "lucide-react";
import { updateUser, type Plan, planLabels } from "@/lib/store";

interface Props { open: boolean; onClose: () => void; }

const PLANS: { id: Plan; price: string; tagline: string; features: string[]; icon: React.ReactNode; recommended?: boolean }[] = [
  {
    id: "free",
    price: "Gratis",
    tagline: "Para empezar a escribir.",
    icon: <Feather className="h-4 w-4" />,
    features: ["1 historia activa", "Asistente Lumi básico", "Biblia esencial", "Modo concentración"],
  },
  {
    id: "cronista",
    price: "€7 / mes",
    tagline: "Para autores comprometidos.",
    icon: <Sparkles className="h-4 w-4" />,
    recommended: true,
    features: ["Hasta 3 historias activas", "Lumi con memoria extendida", "Modo Inmersión completo", "Pulso narrativo en vivo"],
  },
  {
    id: "leyenda",
    price: "€14 / mes",
    tagline: "Para quienes forjan mundos.",
    icon: <Crown className="h-4 w-4" />,
    features: ["Hasta 5 historias activas", "Todos los especialistas IA", "Modo Personaje completo", "Sala de Guerra avanzada", "Exportación profesional"],
  },
];

export function UpgradeDialog({ open, onClose }: Props) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-fade-up">
      <div className="w-full max-w-4xl rounded-3xl glass-strong p-8 shadow-paper glow-border max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="text-[11px] uppercase tracking-[0.25em] text-mint mb-2">Evoluciona en Everlore</div>
            <h2 className="font-serif text-3xl text-ink">Elige tu camino de escritor</h2>
            <p className="mt-2 text-sm text-ink-muted">Cada plan abre nuevas dimensiones de tu universo creativo.</p>
          </div>
          <button onClick={onClose} className="rounded-md p-2 text-ink-muted hover:bg-accent hover:text-ink">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {PLANS.map((p) => (
            <div
              key={p.id}
              className={`relative rounded-2xl border p-6 transition-all ${
                p.recommended
                  ? "border-emerald glass-strong glow-ring"
                  : "border-hairline glass hover:border-emerald/50"
              }`}
            >
              {p.recommended && (
                <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full gradient-emerald px-3 py-0.5 text-[10px] uppercase tracking-widest text-primary-foreground">
                  Recomendado
                </div>
              )}
              <div className="flex items-center gap-2 text-mint">
                {p.icon}
                <span className="text-[10px] uppercase tracking-widest">{planLabels[p.id]}</span>
              </div>
              <div className="mt-3 font-serif text-2xl text-ink">{p.price}</div>
              <div className="mt-1 text-xs text-ink-muted italic">{p.tagline}</div>

              <ul className="mt-5 space-y-2">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-xs text-ink">
                    <Check className="h-3.5 w-3.5 text-mint shrink-0 mt-0.5" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => { updateUser({ plan: p.id }); onClose(); }}
                className={`mt-6 w-full rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
                  p.recommended
                    ? "gradient-emerald text-primary-foreground hover:shadow-glow-lg active:scale-[0.98]"
                    : "border border-hairline bg-paper-elevated text-ink hover:border-emerald hover:text-mint"
                }`}
              >
                {p.id === "free" ? "Volver al Aprendiz" : `Activar ${planLabels[p.id]}`}
              </button>
            </div>
          ))}
        </div>

        <p className="mt-6 text-center text-[11px] text-ink-muted italic">
          Puedes cambiar de plan en cualquier momento. Tu historia siempre permanece tuya.
        </p>
      </div>
    </div>
  );
}
