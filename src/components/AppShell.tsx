import { Link, useRouter, useRouterState } from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { Home, BookText, Settings, LogOut } from "lucide-react";
import { useUser, useStories, planLimits, setUser, useApplyTheme } from "@/lib/store";

export function AppShell({ children }: { children: ReactNode }) {
  useApplyTheme();
  const router = useRouter();
  const user = useUser();
  const stories = useStories();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (!user) router.navigate({ to: "/login" });
  }, [user, router]);

  if (!user) return null;

  const limit = planLimits[user.plan];
  const used = stories.length;

  const navItem = (to: string, icon: ReactNode, label: string) => {
    const active = pathname === to || (to === "/" && pathname === "/");
    return (
      <Link
        to={to}
        className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
          active ? "bg-accent text-ink font-medium" : "text-ink-muted hover:bg-accent/60 hover:text-ink"
        }`}
      >
        {icon}
        <span>{label}</span>
      </Link>
    );
  };

  return (
    <div className="flex min-h-screen w-full bg-paper">
      <aside className="hidden md:flex w-60 shrink-0 flex-col border-r border-hairline bg-paper px-3 py-5">
        <div className="px-2 mb-6">
          <Link to="/" className="font-serif text-2xl font-semibold tracking-tight text-ink">
            Writedy
          </Link>
        </div>
        <nav className="flex flex-col gap-1">
          {navItem("/", <Home className="h-4 w-4" />, "Inicio")}
          {navItem("/ajustes", <Settings className="h-4 w-4" />, "Ajustes")}
        </nav>

        <div className="mt-auto space-y-3">
          <div className="rounded-lg border border-hairline bg-paper-elevated p-3">
            <div className="text-xs text-ink-muted">
              {user.plan === "free" ? "Plan Gratuito" : "Plan Autor"}
            </div>
            <div className="mt-0.5 text-sm text-ink">
              {used} de {limit === Infinity ? "∞" : limit} historias
            </div>
            {user.plan === "free" && (
              <Link to="/ajustes" className="mt-2 inline-block text-xs font-medium text-ember hover:text-ember-hover">
                Mejorar plan →
              </Link>
            )}
          </div>
          <div className="flex items-center gap-2 px-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-ember text-primary-foreground text-sm font-medium">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="truncate text-sm text-ink">{user.name}</div>
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

      <main className="flex-1 min-w-0">{children}</main>
    </div>
  );
}
