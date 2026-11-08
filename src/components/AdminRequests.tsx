import { useCatalog } from "@/lib/catalog";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { REQUEST_STATUS } from "@/lib/requests";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { inputCls } from "@/components/Field";
import type { Database } from "@/integrations/supabase/types";
import { z } from "zod";

type Request = Database["public"]["Tables"]["requests"]["Row"];
export function AdminRequests() {
  const cache = useQueryClient();
  const vendors = useCatalog().vendors;
  const [selected, setSelected] = useState<Request | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const q = useQuery({ queryKey: ["requests"], refetchInterval: 30000, queryFn: async () => {
    const { data, error } = await supabase.from("requests").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  } });
  const attachment = useQuery({ queryKey: ["request-attachment", selected?.attachment_path], enabled: !!selected?.attachment_path, queryFn: async () => {
    if (!selected?.attachment_path) return null;
    const { data, error } = await supabase.storage.from("request-attachments").createSignedUrl(selected.attachment_path, 3600);
    if (error) throw error;
    return data.signedUrl;
  } });
  const update = async (r: Request, status: string) => {
    if (!z.enum(["pending", "quoted", "approved", "rejected"]).safeParse(status).success) return;
    setBusy(r.id);
    try {
      const { data, error } = await supabase.from("requests").update({ status }).eq("id", r.id).select("id").single();
      if (error || !data) throw error;
      await cache.invalidateQueries({ queryKey: ["requests"] }); toast.success("Estado actualizado");
    } catch { toast.error("No se pudo cambiar el estado"); } finally { setBusy(null); }
  };
  return <section className="space-y-4">
    <h2 className="text-2xl font-bold">Solicitudes</h2>
    {q.isLoading && <p>Cargando solicitudes...</p>}{q.isError && <p className="text-destructive">No se pudieron cargar las solicitudes.</p>}
    {!q.isLoading && !q.isError && !q.data?.length && <p className="text-muted-foreground">Sin solicitudes todavía.</p>}
    <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr><th className="p-3">Solicitud</th><th className="p-3">Negocio</th><th className="p-3">Fecha de recepción</th><th className="p-3">Estado</th></tr></thead><tbody>{q.data?.map((r) => <tr key={r.id} className="border-t"><td className="p-3"><Button variant="link" onClick={() => setSelected(r)} className="h-auto whitespace-normal break-all p-0 text-left">{r.code}</Button></td><td className="p-3">{r.business}</td><td className="p-3">{r.delivery_date.replace("T", " ")}</td><td className="p-3"><select aria-label={`Estado ${r.code}`} className={inputCls} disabled={busy === r.id} value={r.status} onChange={(e) => update(r, e.target.value)}>{Object.entries(REQUEST_STATUS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></td></tr>)}</tbody></table></div>
    <Dialog open={!!selected} onOpenChange={() => setSelected(null)}><DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-2xl">{selected && <><DialogHeader><DialogTitle>{selected.business}</DialogTitle></DialogHeader><p className="break-all text-sm">{selected.code}</p><p>{selected.contact} · {selected.phone}</p><p>{selected.address} · {selected.zone}</p><p>{selected.delivery_date.replace("T", " ")}</p>{Array.isArray(selected.items) && selected.items.map((item, i) => {
      if (!item || typeof item !== "object" || Array.isArray(item)) return null;
      const stall = vendors.find((v) => v.id === item.vendor);
      return <div key={i} className="border-t py-3"><p className="text-lg font-bold">{String(item.qty)} × {String(item.name)} · {String(item.unit)}</p><p>{String(item.quality)} · {stall ? `${stall.stall} · ${stall.name}` : "Cualquier puesto"}</p><p>{String(item.notes ?? "")}</p></div>;
    })}{selected.attachment_path && <>{attachment.isLoading && <p>Cargando archivo...</p>}{attachment.isError && <p className="text-destructive">No se pudo abrir el archivo.</p>}{attachment.data && <><a href={attachment.data} target="_blank" rel="noreferrer" className="font-semibold text-primary">Abrir {selected.attachment_name}</a>{/\.(jpg|jpeg|png|webp)$/i.test(selected.attachment_path) && <img src={attachment.data} alt="Lista adjunta" className="h-auto w-full rounded-xl" />}</>}</>}</>}</DialogContent></Dialog>
  </section>;
}