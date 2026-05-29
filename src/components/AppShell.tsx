import { Link, useRouter, useRouterState } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { Home, Settings, LogOut, Sparkles, Trophy, Menu, X, FlaskConical } from "lucide-react";
import { useUser, useStories, planLimits, planLabels, useApplyTheme, computeRank } from "@/lib/store";
import { signOut, useAuthReady } from "@/lib/auth";
import { LumiAvatar } from "@/components/LumiAvatar";
import { UpgradeDialog } from "@/components/UpgradeDialog";

export function AppShell({ children }: { children: ReactNode }) {
  useApplyTheme();
  const router = useRouter();
  const user = useUser();
  const authReady = useAuthReady();
  const stories = useStories();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const [mounted, setMounted] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => {
    if (mounted && authReady && !user) router.navigate({ to: "/login" });
  }, [mounted, authReady, user, router]);
  useEffect(() => { setDrawerOpen(false); }, [pathname]);
  if (!mounted || !authReady || !user) return null;

  const limit = planLimits[user.plan];
  const used = stories.length;
  const rank = computeRank(user.xp);

  const navItem = (to: string, icon: ReactNode, label: string) => {
    const active = pathname === to;
    return (
      <Link
        to={to}
        className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all ${
          active ? "bg-accent text-ink font-medium glow-border" : "text-ink-muted hover:bg-accent/50 hover:text-ink"
        }`}
      >
        {active && <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-0.5 rounded-r bg-emerald shadow-glow-sm" />}
        <span className={active ? "text-mint" : ""}>{icon}</span>
        <span>{label}</span>
      </Link>
    );
  };

  const sidebarInner = (
    <>
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

        <button
          onClick={() => setUpgradeOpen(true)}
          className="w-full text-left rounded-xl border border-hairline bg-paper-elevated/70 p-3.5 hover:border-emerald/60 hover:bg-accent/40 transition group"
          title="Cambiar de plan"
        >
          <div className="flex items-center gap-1.5">
            <Sparkles className="h-3 w-3 text-mint" />
            <div className="text-[10px] uppercase tracking-widest text-ink-muted">Plan {planLabels[user.plan]}</div>
          </div>
          <div className="mt-1 text-sm text-ink">
            {used} de {limit === Infinity ? "∞" : limit} historias
          </div>
          <div className="mt-2 text-xs font-medium text-mint group-hover:text-neon transition">
            {user.plan === "leyenda" ? "Ver planes →" : "Cambiar plan →"}
          </div>
        </button>

        <div className="flex items-center gap-2 px-1 pt-1">
          <div className="flex h-9 w-9 items-center justify-center rounded-full gradient-emerald text-primary-foreground text-sm font-medium glow-ring">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="truncate text-sm text-ink">{user.name}</div>
            <div className="truncate text-[10px] text-ink-muted">{user.email || "Escritor de Everlore"}</div>
          </div>
          <button
            onClick={async () => { await signOut(); router.navigate({ to: "/login" }); }}
            title="Cerrar sesión"
            className="rounded-md p-1.5 text-ink-muted hover:bg-accent hover:text-ink"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </>
  );

  return (
    <div className="flex h-[100dvh] w-full bg-ambient overflow-hidden">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-64 shrink-0 flex-col border-r border-hairline glass px-3 py-5 relative h-[100dvh] overflow-hidden">
        {sidebarInner}
      </aside>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex animate-fade-up">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDrawerOpen(false)} />
          <aside className="relative flex w-72 max-w-[85vw] flex-col glass-strong border-r border-hairline px-3 py-5 h-[100dvh] overflow-y-auto safe-top safe-bottom">
            <button
              onClick={() => setDrawerOpen(false)}
              className="absolute top-3 right-3 rounded-md p-1.5 text-ink-muted hover:text-ink"
              aria-label="Cerrar menú"
            >
              <X className="h-4 w-4" />
            </button>
            {sidebarInner}
          </aside>
        </div>
      )}

      <main className="flex-1 min-w-0 relative h-[100dvh] overflow-y-auto">
        {/* Mobile top bar */}
        <div className="md:hidden sticky top-0 z-30 flex items-center gap-3 px-4 py-3 glass border-b border-hairline safe-top">
          <button
            onClick={() => setDrawerOpen(true)}
            className="rounded-md p-1.5 text-ink hover:bg-accent"
            aria-label="Abrir menú"
          >
            <Menu className="h-5 w-5" />
          </button>
          <Link to="/" className="flex items-center gap-2 min-w-0">
            <LumiAvatar size={24} state="idle" />
            <div className="font-serif text-lg gradient-text truncate">Everlore</div>
          </Link>
          <div className="flex-1" />
          <div className="text-[10px] uppercase tracking-widest text-mint flex items-center gap-1">
            <Trophy className="h-3 w-3" /> Nv {rank.level}
          </div>
        </div>

        <div className="pb-20 md:pb-0">{children}</div>

        {/* Mobile bottom nav */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 glass-strong border-t border-hairline safe-bottom">
          <div className="grid grid-cols-3">
            <BottomLink to="/" icon={<Home className="h-5 w-5" />} label="Biblioteca" active={pathname === "/"} />
            <BottomLink to="/ajustes" icon={<FlaskConical className="h-5 w-5" />} label="Lab" active={pathname.startsWith("/ajustes")} />
            <BottomLink to="/ajustes" icon={<Settings className="h-5 w-5" />} label="Ajustes" active={false} />
          </div>
        </nav>
      </main>
    </div>
  );
}

function BottomLink({ to, icon, label, active }: { to: string; icon: ReactNode; label: string; active: boolean }) {
  return (
    <Link
      to={to}
      className={`flex flex-col items-center justify-center gap-0.5 py-2.5 text-[10px] uppercase tracking-widest transition ${
        active ? "text-mint" : "text-ink-muted hover:text-ink"
      }`}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
}
