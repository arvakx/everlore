import { useMemo } from "react";

interface Props {
  count?: number;
  className?: string;
}

/**
 * Magical drifting particles — ambient floating green motes.
 */
export function Particles({ count = 18, className = "" }: Props) {
  const items = useMemo(
    () =>
      Array.from({ length: count }).map((_, i) => ({
        key: i,
        left: Math.random() * 100,
        size: 1 + Math.random() * 3,
        duration: 16 + Math.random() * 22,
        delay: Math.random() * 12,
        opacity: 0.4 + Math.random() * 0.5,
      })),
    [count]
  );
  return (
    <div className={`particles ${className}`} aria-hidden>
      {items.map((p) => (
        <span
          key={p.key}
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size,
            animationDuration: `${p.duration}s`,
            animationDelay: `-${p.delay}s`,
            opacity: p.opacity,
          }}
        />
      ))}
    </div>
  );
}
