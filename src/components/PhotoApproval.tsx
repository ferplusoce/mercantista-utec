import { useCatalog } from "@/lib/catalog";
import { useState } from "react";
import { Camera, Check, Pencil } from "lucide-react";
import { toast } from "sonner";
import { soles } from "@/lib/data";
import { type Order } from "@/lib/store";
import { responseMinutes, useOrderPhotos, usePhotoActions } from "@/lib/photos";

const STATUS_TXT = { pendiente: "Esperando al cliente", aprobado: "Aprobado", cambiar: "Pide cambio" } as const;

/** Panel del comprador: subir foto y precio real por producto. */
export function AdminPhotos({ o }: { o: Order }) {
  const { data: photos = [] } = useOrderPhotos(o.code);
  const act = usePhotoActions(o.code);
  const vendors = useCatalog().vendors;
  const [busy, setBusy] = useState<number | null>(null);
  const [prices, setPrices] = useState<Record<number, string>>({});
  const approved = photos.filter((p) => p.status === "aprobado").length;
  const missing = o.items.length - approved;
  const times = photos.map(responseMinutes).filter((m): m is number => m !== null);
  const canUpload = o.status === "purchasing";

  const onFile = async (idx: number, file?: File) => {
    if (!file) { return; }
    const price = +(prices[idx] ?? o.items[idx].unitPrice);
    if (!(price > 0)) { toast.error("Escribe el precio real"); return; }
    setBusy(idx);
    try { await act.upload(idx, file, price); toast.success("Foto enviada al cliente"); } catch { toast.error("No se pudo subir la foto"); } finally { setBusy(null); }
  };

  return (
    <div className="space-y-3 rounded-xl border p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-semibold">Aprobación por foto</p>
        <span className={`rounded-full px-3 py-1 text-sm font-semibold ${missing ? "bg-secondary text-secondary-foreground" : "bg-success/15 text-success"}`}>{missing ? `Faltan aprobar ${missing} de ${o.items.length}` : "Todo aprobado"}</span>
      </div>
      {times.length > 0 && <p className="text-xs text-muted-foreground">Tiempo de respuesta promedio: <b>{Math.round(times.reduce((a, b) => a + b, 0) / times.length)} min</b></p>}
      {!canUpload && <p className="text-xs text-muted-foreground">Cambia el pedido a "Comprando en Unicachi" para subir fotos.</p>}
      {o.items.map((it, idx) => {
        const p = photos.find((x) => x.item_index === idx);
        const v = vendors.find((x) => x.id === it.vendorId);
        const mins = p ? responseMinutes(p) : null;
        return (
          <div key={idx} className="flex gap-3 rounded-xl bg-muted p-2 text-sm">
            {p?.url ? <img src={p.url} alt={it.name} className="h-16 w-16 shrink-0 rounded-lg object-cover" /> : <div className="grid h-16 w-16 shrink-0 place-items-center rounded-lg bg-card"><Camera className="h-5 w-5 text-muted-foreground" /></div>}
            <div className="min-w-0 flex-1 space-y-1">
              <p className="font-medium">{it.qty} × {it.name} <span className="text-muted-foreground">· {v?.stall ?? "—"}</span></p>
              {p && <p className="text-xs">{STATUS_TXT[p.status]} · {soles(p.real_price ?? 0)}{mins !== null && ` · respondió en ${mins} min`}{p.client_comment && <> · <em>"{p.client_comment}"</em></>}</p>}
              {canUpload && p?.status !== "aprobado" && (
                <div className="flex gap-2">
                  <input type="number" step="0.5" inputMode="decimal" aria-label="Precio real" placeholder="Precio real" className="h-10 w-24 rounded-lg border bg-card px-2" value={prices[idx] ?? String(p?.real_price ?? it.unitPrice)} onChange={(e) => setPrices({ ...prices, [idx]: e.target.value })} />
                  <label className={`inline-flex h-10 flex-1 cursor-pointer items-center justify-center rounded-lg bg-primary px-3 font-semibold text-primary-foreground ${busy === idx ? "opacity-50" : ""}`}>
                    <Camera className="mr-1 h-4 w-4" />{busy === idx ? "Subiendo..." : p ? "Nueva foto" : "Tomar foto"}
                    <input type="file" accept="image/*" capture="environment" className="hidden" disabled={busy !== null} onChange={(e) => { onFile(idx, e.target.files?.[0]); e.target.value = ""; }} />
                  </label>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/** Vista del cliente: aprobar o pedir cambio de cada producto. */
export function ClientPhotos({ o }: { o: Order }) {
  const { data: photos = [] } = useOrderPhotos(o.code);
  const act = usePhotoActions(o.code);
  const vendors = useCatalog().vendors;
  const [changing, setChanging] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);
  if (!photos.length) return null;

  const respond = async (idx: number, ok: boolean) => {
    setBusy(true);
    try { await act.respond(idx, ok, ok ? undefined : comment); toast.success(ok ? "¡Aprobado!" : "Enviado al comprador"); setChanging(null); setComment(""); }
    catch { toast.error("No se pudo enviar. Intenta otra vez."); } finally { setBusy(false); }
  };

  return (
    <div className="space-y-3">
      <p className="text-lg font-bold">Mira tus productos</p>
      {photos.map((p) => {
        const it = o.items[p.item_index];
        if (!it) return null;
        const v = vendors.find((x) => x.id === it.vendorId);
        const open = o.status === "purchasing" && p.status === "pendiente";
        return (
          <div key={p.item_index} className="overflow-hidden rounded-2xl border bg-card">
            {p.url && <img src={p.url} alt={it.name} loading="lazy" className="aspect-[4/3] w-full object-cover" />}
            <div className="space-y-3 p-4">
              <div>
                <p className="text-lg font-bold">{it.name}</p>
                <p className="text-sm text-muted-foreground">{it.qty} × {it.unit} · Puesto {v?.stall ?? "—"}</p>
                <p className="mt-1 text-2xl font-bold">{soles(p.real_price ?? 0)} <span className="text-sm font-normal text-muted-foreground">c/u</span></p>
              </div>
              {p.status === "aprobado" && <p className="rounded-xl bg-success/15 p-3 font-semibold text-success">✓ Aprobado</p>}
              {p.status === "cambiar" && <p className="rounded-xl bg-secondary p-3 text-sm">Pediste cambio{p.client_comment && `: "${p.client_comment}"`}. Te mandaremos otra foto.</p>}
              {open && changing !== p.item_index && (
                <div className="grid grid-cols-2 gap-3">
                  <button disabled={busy} onClick={() => respond(p.item_index, true)} className="inline-flex h-14 items-center justify-center rounded-xl bg-success text-lg font-bold text-success-foreground disabled:opacity-50"><Check className="mr-2 h-6 w-6" />Aprobar</button>
                  <button disabled={busy} onClick={() => setChanging(p.item_index)} className="inline-flex h-14 items-center justify-center rounded-xl border-2 text-lg font-bold disabled:opacity-50"><Pencil className="mr-2 h-5 w-5" />Cambiar</button>
                </div>
              )}
              {open && changing === p.item_index && (
                <div className="space-y-2">
                  <input autoFocus maxLength={200} value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Ej. más maduro, otro puesto" className="h-14 w-full rounded-xl border bg-card px-4 text-lg" />
                  <div className="grid grid-cols-2 gap-3">
                    <button disabled={busy} onClick={() => respond(p.item_index, false)} className="h-14 rounded-xl bg-primary text-lg font-bold text-primary-foreground disabled:opacity-50">Enviar</button>
                    <button onClick={() => setChanging(null)} className="h-14 rounded-xl border-2 text-lg font-bold">Volver</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
