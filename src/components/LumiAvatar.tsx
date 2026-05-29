import { useId } from "react";

interface Props {
  size?: number;
  state?: "idle" | "thinking" | "happy" | "mystic";
  className?: string;
}

/**
 * Lumi — espíritu narrativo de Everlore. Orbe luminoso de tinta y luz.
 */
export function LumiAvatar({ size = 36, state = "idle", className = "" }: Props) {
  const id = useId().replace(/:/g, "");
  const colors = {
    idle:     ["#34D399", "#10B981", "#22D3EE"],
    thinking: ["#86EFAC", "#22D3EE", "#A78BFA"],
    happy:    ["#BBF7D0", "#34D399", "#10B981"],
    mystic:   ["#A7F3D0", "#22D3EE", "#7DD3FC"],
  }[state];

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      <div
        className="absolute inset-0 rounded-full lumi-halo"
        style={{
          background: `radial-gradient(circle, ${colors[0]}55 0%, ${colors[1]}22 50%, transparent 70%)`,
          filter: "blur(8px)",
        }}
      />
      <svg viewBox="0 0 64 64" width={size} height={size} className="lumi-orb relative">
        <defs>
          <radialGradient id={`g1${id}`} cx="50%" cy="40%" r="60%">
            <stop offset="0%" stopColor={colors[0]} stopOpacity="1" />
            <stop offset="50%" stopColor={colors[1]} stopOpacity="0.85" />
            <stop offset="100%" stopColor={colors[2]} stopOpacity="0.4" />
          </radialGradient>
          <radialGradient id={`g2${id}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="white" stopOpacity="0.8" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx="32" cy="32" r="22" fill={`url(#g1${id})`} />
        <circle cx="26" cy="24" r="7" fill={`url(#g2${id})`} />
        <circle cx="32" cy="32" r="22" fill="none" stroke={colors[0]} strokeOpacity="0.5" strokeWidth="0.5" />
        <circle cx="32" cy="32" r="28" fill="none" stroke={colors[1]} strokeOpacity="0.25" strokeWidth="0.5" strokeDasharray="2 4" />
      </svg>
    </div>
  );
}
