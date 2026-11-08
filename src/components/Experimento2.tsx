import { useQuery } from "@tanstack/react-query";
import { Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { GOAL, OP_ZONES, computeStats, deliveryBreakdown, toCSV, type Opinion } from "@/lib/opinions";
import { Card } from "@/components/Field";
import { DataSkeleton, ConnectionError } from "@/components/DataState";

function Kpi({ l, v, ok, meta }: { l: string; v: string; ok: boolean; meta: string }) {
  return (
    <Card className={`border-2 ${ok ? "border-success" : "border-destructive"}`}>
      <p className="text-sm text-muted-foreground">{l}</p>
      <p className={`font-display text-3xl font-bold ${ok ? "text-success" : "text-destructive"}`}>{v}</p>
      <p className="text-xs text-muted-foreground">Meta: {meta}</p>
    </Card>
  );
}

function Breakdown({ title, rows }: { title: string; rows: [string, number][] }) {
  const max = Math.max(1, ...rows.map((r) => r[1]));
  return (
    <Card><p className="mb-2 font-semibold">{title}</p>
      {rows.map(([k, n]) => <div key={k} className="py-1 text-sm"><div className="flex justify-between"><span>{k}</span><b>{n}</b></div><div className="h-2 rounded bg-muted"><div className="h-2 rounded bg-primary" style={{ width: `${(n / max) * 100}%` }} /></div></div>)}
    </Card>
  );
}

export function Experimento2() {
  const q = useQuery({ queryKey: ["opinions"], refetchInterval: 30_000, queryFn: async () => {
    const { data, error } = await supabase.from("opinions").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    return data as Opinion[];
  } });
  const list = q.data ?? [];
  const s = computeStats(list);
  const download = () => {
    const blob = new Blob(["\ufeff" + toCSV(list)], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `opiniones-${new Date().toISOString().slice(0, 10)}.csv`; a.click();
  };
  if (q.isLoading) return <DataSkeleton />;
  if (q.isError) return <ConnectionError retry={q.refetch} />;
  return (
    <div className="space-y-4">
      <Card className="flex flex-wrap items-center justify-between gap-3">
        <div><p className="text-sm text-muted-foreground">Opiniones recogidas</p><p className="font-display text-5xl font-extrabold"><span className={s.n >= GOAL ? "text-success" : "text-primary"}>{s.n}</span> / {GOAL}</p></div>
        <button onClick={download} disabled={!list.length} className="inline-flex h-12 items-center rounded-xl bg-primary px-5 font-semibold text-primary-foreground disabled:opacity-50"><Download className="mr-2 h-5 w-5" />Descargar CSV</button>
      </Card>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Kpi l="Armó sin ayuda" v={`${s.sinAyuda}%`} ok={s.sinAyuda >= 70} meta="70%" />
        <Kpi l="Tardó menos de 5 min" v={`${s.menos5}%`} ok={s.menos5 >= 70} meta="70%" />
        <Kpi l="Satisfacción promedio" v={`${s.satisfaccion}/5`} ok={s.satisfaccion >= 4} meta="4/5" />
        <Kpi l="Lo usaría y dejó WhatsApp" v={`${s.usariaWa}%`} ok={s.usariaWa >= 40} meta="40%" />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Breakdown title="Por zona" rows={OP_ZONES.map((z) => [z, list.filter((o) => o.zona === z).length])} />
        <Breakdown title="Por tipo de entrega" rows={deliveryBreakdown(list)} />
      </div>
      {q.isLoading && <p className="text-center text-muted-foreground">Cargando...</p>}
    </div>
  );
}
