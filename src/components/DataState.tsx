import type { ReactNode } from "react";
import { RefreshCw, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { refreshCatalog, useCatalog } from "@/lib/catalog";

export function DataSkeleton() {
  return <div role="status" aria-label="Cargando datos" className="space-y-5 py-4"><span className="sr-only">Cargando datos…</span><Skeleton className="h-8 w-2/3" /><Skeleton className="h-12 w-full" /><div className="grid grid-cols-2 gap-3">{Array.from({ length: 6 }, (_, i) => <div key={i} className="space-y-3"><Skeleton className="h-32 w-full" /><Skeleton className="h-5 w-3/4" /><Skeleton className="h-11 w-full" /></div>)}</div></div>;
}

export function ConnectionError({ retry }: { retry: () => unknown }) {
  return <div role="alert" className="space-y-4 py-8 text-center"><WifiOff className="mx-auto h-8 w-8 text-muted-foreground" /><h2 className="text-xl font-semibold">No pudimos cargar los datos</h2><p className="text-muted-foreground">Revisa tu conexión a internet y vuelve a intentarlo.</p><Button onClick={() => { void retry(); }}><RefreshCw />Reintentar</Button></div>;
}

export function CatalogGate({ children }: { children: ReactNode }) {
  const catalog = useCatalog();
  if (!catalog.loaded) return <DataSkeleton />;
  if (catalog.error) return <ConnectionError retry={refreshCatalog} />;
  return children;
}