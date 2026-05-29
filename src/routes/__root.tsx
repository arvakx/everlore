import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-aurora px-4">
      <div className="max-w-md text-center glass-strong rounded-3xl p-10 glow-border">
        <h1 className="text-7xl font-serif gradient-text text-glow">404</h1>
        <h2 className="mt-4 text-xl text-ink font-serif">Este rincón aún no existe</h2>
        <p className="mt-2 text-sm text-ink-muted">
          Tal vez te perdiste de camino a tu historia. Lumi te espera al inicio.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-xl gradient-emerald px-5 py-2.5 text-sm font-medium text-primary-foreground hover:shadow-glow transition"
          >
            Volver a Everlore
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  return (
    <div className="flex min-h-screen items-center justify-center bg-aurora px-4">
      <div className="max-w-md text-center glass-strong rounded-3xl p-10 glow-border">
        <h1 className="text-xl font-serif text-ink">Algo se trabó en el éter</h1>
        <p className="mt-2 text-sm text-ink-muted">
          Intenta de nuevo. Tu trabajo está guardado.
        </p>
        <div className="mt-6 flex justify-center gap-2">
          <button
            onClick={() => { router.invalidate(); reset(); }}
            className="rounded-xl gradient-emerald px-4 py-2 text-sm font-medium text-primary-foreground hover:shadow-glow"
          >
            Reintentar
          </button>
          <a href="/" className="rounded-xl border border-hairline bg-paper-elevated px-4 py-2 text-sm font-medium text-ink hover:border-emerald">
            Inicio
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Everlore — Tu universo creativo, acompañado por Lumi" },
      { name: "description", content: "Everlore es un santuario inteligente para escribir tu novela: Lumi, tu asistente narrativo, recuerda tu mundo y camina contigo." },
      { name: "author", content: "Everlore" },
      { name: "theme-color", content: "#10B981" },
      { property: "og:title", content: "Everlore — Tu universo creativo, acompañado por Lumi" },
      { property: "og:description", content: "Everlore es un santuario inteligente para escribir tu novela: Lumi, tu asistente narrativo, recuerda tu mundo y camina contigo." },
      { property: "og:type", content: "website" },
      { name: "twitter:title", content: "Everlore — Tu universo creativo, acompañado por Lumi" },
      { name: "twitter:description", content: "Everlore es un santuario inteligente para escribir tu novela: Lumi, tu asistente narrativo, recuerda tu mundo y camina contigo." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/1d2a72d0-1820-4c60-9689-fe356f6c1042/id-preview-f8d95505--599ad686-d733-405f-a08c-745dd0122d1f.lovable.app-1780030053849.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/1d2a72d0-1820-4c60-9689-fe356f6c1042/id-preview-f8d95505--599ad686-d733-405f-a08c-745dd0122d1f.lovable.app-1780030053849.png" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=Inter+Tight:wght@400;500;600;700&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
    </QueryClientProvider>
  );
}
