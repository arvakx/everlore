import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-serif text-ink">404</h1>
        <h2 className="mt-4 text-xl text-ink">Esta página no existe</h2>
        <p className="mt-2 text-sm text-ink-muted">
          Tal vez te perdiste de camino a tu historia. Vuelve al inicio cuando quieras.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-lg bg-ember px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-ember-hover"
          >
            Volver al inicio
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
    <div className="flex min-h-screen items-center justify-center bg-paper px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-serif text-ink">Algo se trabó</h1>
        <p className="mt-2 text-sm text-ink-muted">
          Intenta de nuevo. Tu trabajo está guardado.
        </p>
        <div className="mt-6 flex justify-center gap-2">
          <button
            onClick={() => { router.invalidate(); reset(); }}
            className="rounded-lg bg-ember px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-ember-hover"
          >
            Reintentar
          </button>
          <a href="/" className="rounded-lg border border-hairline bg-paper-elevated px-4 py-2 text-sm font-medium text-ink hover:bg-accent">
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
      { title: "Writedy — Tu espacio para escribir, acompañado" },
      { name: "description", content: "Writedy es un espacio cálido y profesional para escribir tu libro, con un asistente que conoce tu historia." },
      { name: "author", content: "Writedy" },
      { property: "og:title", content: "Writedy" },
      { property: "og:description", content: "Tu espacio para escribir, acompañado." },
      { property: "og:type", content: "website" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;0,6..72,600;0,6..72,700;1,6..72,400&display=swap",
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
