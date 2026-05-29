import { Link, useRouter, useRouterState } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { Home, Settings, LogOut, Sparkles, Trophy } from "lucide-react";
import { useUser, useStories, planLimits, planLabels, setUser, useApplyTheme, computeRank } from "@/lib/store";
import { LumiAvatar } from "@/components/LumiAvatar";

export function AppShell({ children }: { children: ReactNode }) {
  useApplyTheme();
  const router = useRouter();
  const user = useUser();
  const stories = useStories();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  useEffect(() => {
    if (mounted && !user) router.navigate({ to: "/login" });
  }, [mounted, user, router]);
  if (!mounted || !user) return null;

  const limit = planLimits[user.plan];
  const used = stories.length;
  const rank = computeRank(user.xp);

  const navItem = (to: string, icon: ReactNode, label: string) => {
    const active = pathname === to;
    return (
      <Link
        to={to}
        className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all ${
          active
            ? "bg-accent text-ink font-medium glow-border"
            : "text-ink-muted hover:bg-accent/50 hover:text-ink"
        }`}
      >
        {active && <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-0.5 rounded-r bg-emerald shadow-glow-sm" />}
        <span className={active ? "text-mint" : ""}>{icon}</span>
        <span>{label}</span>
      </Link>
    );
  };

  return (
    <div className="flex h-screen w-full bg-ambient overflow-hidden">
      <aside className="hidden md:flex w-64 shrink-0 flex-col border-r border-hairline glass px-3 py-5 relative h-screen overflow-hidden">

        <div className="px-3 mb-7">
          <Link to="/" className="flex items-center gap-2.5">
            <LumiAvatar size={32} state="idle" />
            <div>
              <div className="font-serif text-xl font-medium tracking-tight gradient-text leading-none">Everlore</div>
              <div className="text-[10px] text-ink-muted mt-0.5 tracking-widest uppercase">Tu universo creativo</div>
            </div>
          </Link>
        </div>

        <nav className="flex flex-col gap-1 px-1">
          {navItem("/", <Home className="h-4 w-4" />, "Biblioteca")}
          {navItem("/ajustes", <Settings className="h-4 w-4" />, "Ajustes")}
        </nav>

        <div className="mt-auto space-y-3 px-1">
          {/* Rango */}
          <div className="rounded-xl border border-hairline bg-paper-elevated/70 p-3.5 glow-border">
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="h-3.5 w-3.5 text-mint" />
              <span className="text-[10px] uppercase tracking-widest text-ink-muted">Nivel {rank.level}</span>
            </div>
            <div className="font-serif text-sm text-ink leading-tight">{rank.title}</div>
            <div className="mt-2 h-1 rounded-full bg-hairline overflow-hidden">
              <div className="h-full gradient-emerald transition-all" style={{ width: `${rank.progress * 100}%` }} />
            </div>
            <div className="mt-1 text-[10px] text-ink-muted">{user.xp} XP</div>
          </div>

          {/* Plan */}
          <div className="rounded-xl border border-hairline bg-paper-elevated/70 p-3.5">
            <div className="flex items-center gap-1.5">
              <Sparkles className="h-3 w-3 text-mint" />
              <div className="text-[10px] uppercase tracking-widest text-ink-muted">Plan {planLabels[user.plan]}</div>
            </div>
            <div className="mt-1 text-sm text-ink">
              {used} de {limit === Infinity ? "∞" : limit} historias
            </div>
            {user.plan !== "leyenda" && (
              <Link to="/ajustes" className="mt-2 inline-block text-xs font-medium text-mint hover:text-neon transition">
                Evolucionar plan →
              </Link>
            )}
          </div>

          <div className="flex items-center gap-2 px-1 pt-1">
            <div className="flex h-9 w-9 items-center justify-center rounded-full gradient-emerald text-primary-foreground text-sm font-medium glow-ring">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="truncate text-sm text-ink">{user.name}</div>
              <div className="truncate text-[10px] text-ink-muted">{user.email || "Escritor de Everlore"}</div>
            </div>
            <button
              onClick={() => { setUser(null); router.navigate({ to: "/login" }); }}
              title="Cerrar sesión"
              className="rounded-md p-1.5 text-ink-muted hover:bg-accent hover:text-ink"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 min-w-0 relative h-screen overflow-y-auto">{children}</main>
    </div>
  );
}
