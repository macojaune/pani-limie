import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createRootRoute, Link, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
const queryClient = new QueryClient();

export const Route = createRootRoute({
  component: () => (
    <div className="flex min-h-screen flex-col">
      <header className="flex flex-row items-center justify-between gap-4 bg-slate-900 p-4 text-white  ">
        <div
          className={
            location.pathname.includes("pani-dlo")
              ? "order-2 text-right"
              : "order-1 text-left"
          }
        >
          <Link to="/">
            <h1 className="text-3xl font-bold text-amber-400">Pani limyè</h1>
          </Link>
          {!location.pathname.includes("pani-dlo") && (
            <span className="text-xs">On dit merci EDF PEI…</span>
          )}
        </div>
        <div
          className={
            location.pathname.includes("pani-dlo")
              ? "order-1 text-left"
              : "order-2 text-right"
          }
        >
          <Link to="/pani-dlo">
            <h1 className="text-3xl font-bold text-cyan-400">Pani Dlo</h1>
          </Link>
          {location.pathname.includes("pani-dlo") && (
            <span className="text-xs">On dit merci la Guadeloupe</span>
          )}
        </div>
      </header>
      <QueryClientProvider client={queryClient}>
        <Outlet />
      </QueryClientProvider>
      {process.env.NODE_ENV === "development" && <TanStackRouterDevtools />}
    </div>
  ),
});
