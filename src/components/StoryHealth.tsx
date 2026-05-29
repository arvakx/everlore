import type { Story } from "@/lib/store";
import { computeStoryHealth } from "@/lib/store";

interface Props { story: Story; }

export function StoryHealth({ story }: Props) {
  const metrics = computeStoryHealth(story);
  return (
    <div className="rounded-2xl glass p-5 glow-border">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-mint">Salud de la historia</div>
          <h3 className="font-serif text-xl text-ink mt-0.5">Pulso narrativo</h3>
        </div>
        <div className="text-[10px] text-ink-muted italic">Análisis en vivo</div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {metrics.map((m) => (
          <Meter key={m.key} label={m.label} value={m.value} />
        ))}
      </div>
    </div>
  );
}

function Meter({ label, value }: { label: string; value: number }) {
  const r = 26;
  const c = 2 * Math.PI * r;
  const offset = c - (c * value) / 100;
  return (
    <div className="flex flex-col items-center text-center p-2">
      <div className="relative">
        <svg width="68" height="68" viewBox="0 0 68 68">
          <defs>
            <linearGradient id={`grad-${label}`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="var(--color-mint)" />
              <stop offset="100%" stopColor="var(--color-emerald)" />
            </linearGradient>
          </defs>
          <circle cx="34" cy="34" r={r} fill="none" stroke="var(--color-hairline)" strokeWidth="4" />
          <circle
            cx="34" cy="34" r={r} fill="none"
            stroke={`url(#grad-${label})`} strokeWidth="4" strokeLinecap="round"
            strokeDasharray={c} strokeDashoffset={offset}
            transform="rotate(-90 34 34)"
            style={{ transition: "stroke-dashoffset 0.6s ease", filter: "drop-shadow(0 0 6px var(--color-mint))" }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center text-xs font-medium text-ink">{value}</div>
      </div>
      <div className="mt-1.5 text-[10px] text-ink-muted leading-tight">{label}</div>
    </div>
  );
}
