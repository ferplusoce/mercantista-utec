import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import { DataSkeleton } from "./components/DataState";

export const getRouter = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: 1 } } });

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
    defaultPendingComponent: DataSkeleton,
    defaultPendingMs: 150,
  });

  return router;
};
