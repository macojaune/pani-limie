import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createRootRoute, Link, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
const queryClient = new QueryClient();

export const Route = createRootRoute({
  component: () => (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center gap-4 bg-slate-900 p-4 text-white md:flex-row">
        <Link to="/">
          <h1 className="text-3xl font-bold text-amber-400">Pani limiè !</h1>
        </Link>
        <span>On dit merci EDF PEI…</span>
      </header>
      <QueryClientProvider client={queryClient}>
        <Outlet />
      </QueryClientProvider>
      {process.env.NODE_ENV === "development" && <TanStackRouterDevtools />}
    </div>
  ),
});
