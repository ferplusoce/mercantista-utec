import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CheckCircle2, ImageUp, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { ZONES, waLink } from "@/lib/data";
import { type CustomRequest } from "@/lib/store";
import { useCatalog } from "@/lib/catalog";
import { submitRequest } from "@/lib/requests";
import { Button } from "@/components/ui/button";
import { Card, Field, inputCls, requireFields } from "@/components/Field";

export const Route = createFileRoute("/solicitud")({
  validateSearch: (s: Record<string, unknown>) => ({ vendor: s.vendor as string | undefined }),
  head: () => ({ meta: [
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
    { title: "Solicitud personalizada — Mercantista" },
    { name: "description", content: "Envía tu lista de compras y la cotizamos en Unicachi por ti." },
    { property: "og:title", content: "Cotiza tu lista en Unicachi — Mercantista" },
    { property: "og:description", content: "Escribe tu lista o sube una foto y te cotizamos." },
  ] }),
  component: Solicitud,
});

type Row = CustomRequest["items"][number];
const empty = (vendor = ""): Row => ({ name: "", qty: "1", unit: "Saco", quality: "Primera", vendor, notes: "" });

function Solicitud() {
  const { vendor } = Route.useSearch();
  const catalog = useCatalog();
  const vendors = catalog.vendors.filter((v) => v.active);
  const [mode, setMode] = useState<"lista" | "foto">("lista");
  const [rows, setRows] = useState<Row[]>([empty(vendor)]);
  const [file, setFile] = useState<{ name: string; url?: string; raw: File } | null>(null);
  const [sending, setSending] = useState(false);
  const [f, setF] = useState({ business: "", contact: "", phone: "", address: "", zone: ZONES[0] as string, date: "" });
  const [err, setErr] = useState<Record<string, string>>({});
  const [done, setDone] = useState<string | null>(null);
  const upd = (i: number, k: keyof Row, v: string) => setRows((r) => r.map((x, j) => (j === i ? { ...x, [k]: v } : x)));

  const submit = async () => {
    if (sending) return;
    const e = requireFields(f, ["business", "contact", "phone", "address", "date"]);
    const items = rows.filter((r) => r.name.trim());
    if (mode === "lista" && items.length === 0) e.items = "Agrega al menos un producto";
    if (mode === "foto" && !file) e.items = "Adjunta la foto o archivo de tu lista";
    setErr(e);
    if (Object.keys(e).length) { toast.error("Revisa los campos marcados"); return; }
    setSending(true);
    try {
      const code = await submitRequest({ business: f.business, contact: f.contact, phone: f.phone, address: f.address, zone: f.zone, delivery_date: f.date, items: mode === "lista" ? items : [] }, mode === "foto" ? file?.raw : undefined);
      toast.success("Solicitud enviada"); setDone(code);
    } catch (error) { toast.error(error instanceof Error && error.name !== "ZodError" ? error.message : "Revisa los datos: celular de 9 dígitos y cantidades mayores a cero"); }
    finally { setSending(false); }
  };

  if (done) return (
    <Card className="mx-auto max-w-lg text-center">
      <CheckCircle2 className="mx-auto h-14 w-14 text-success" />
      <h1 className="mt-3 text-2xl font-bold">¡Solicitud recibida, casero!</h1>
      <p className="mt-1 text-muted-foreground">Tu número de confirmación es</p>
      <p className="break-all font-display text-2xl font-extrabold text-primary">{done}</p>
      <p className="mt-2 text-sm text-muted-foreground">Cotizamos en Unicachi y te escribimos por WhatsApp antes de las 05:00 am.</p>
      <a href={waLink(`Hola Mercantista, envié la solicitud ${done}`, catalog.tariffs.whatsapp)} target="_blank" rel="noreferrer" className="mt-5 inline-flex h-12 items-center rounded-xl bg-success px-6 font-semibold text-success-foreground">Escribir por WhatsApp</a>
    </Card>
  );

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <div><h1 className="text-3xl font-bold">Solicitud personalizada</h1><p className="text-muted-foreground">Mándanos tu lista como la escribes siempre. Nosotros buscamos en los puestos de Unicachi y te cotizamos.</p></div>
      <div className="grid grid-cols-2 gap-2 rounded-2xl bg-muted p-1">
        {(["lista", "foto"] as const).map((m) => <button key={m} onClick={() => setMode(m)} className={`h-11 rounded-xl text-sm font-semibold ${mode === m ? "bg-card shadow-sm" : ""}`}>{m === "lista" ? "Escribir lista" : "Subir foto o archivo"}</button>)}
      </div>
      {mode === "lista" ? (
        <Card className="space-y-3">
          {rows.map((r, i) => (
            <div key={i} className="grid gap-2 rounded-xl border p-3 md:grid-cols-12">
              <input className={inputCls + " md:col-span-3"} placeholder="Producto (ej. Papa Canchán)" value={r.name} onChange={(e) => upd(i, "name", e.target.value)} />
              <input className={inputCls + " md:col-span-1"} type="number" min={1} value={r.qty} onChange={(e) => upd(i, "qty", e.target.value)} />
              <select className={inputCls + " md:col-span-2"} value={r.unit} onChange={(e) => upd(i, "unit", e.target.value)}>{["Saco", "Jaba", "Caja", "Malla", "Atado", "Kilos"].map((u) => <option key={u}>{u}</option>)}</select>
              <select className={inputCls + " md:col-span-2"} value={r.quality} onChange={(e) => upd(i, "quality", e.target.value)}>{["Primera", "Comercial", "Económica"].map((u) => <option key={u}>{u}</option>)}</select>
              <select className={inputCls + " md:col-span-3"} value={r.vendor} onChange={(e) => upd(i, "vendor", e.target.value)}><option value="">Cualquier puesto</option>{vendors.map((v) => <option key={v.id} value={v.id}>{v.stall} · {v.name}</option>)}</select>
              <button onClick={() => setRows((x) => x.filter((_, j) => j !== i))} className="grid h-11 place-items-center rounded-xl border md:col-span-1" aria-label="Quitar"><Trash2 className="h-4 w-4" /></button>
              <input className={inputCls + " md:col-span-12"} placeholder="Notas (ej. papas medianas para freír, tomates pintones)" value={r.notes} onChange={(e) => upd(i, "notes", e.target.value)} />
            </div>
          ))}
          <button onClick={() => setRows((x) => [...x, empty()])} className="inline-flex h-11 items-center rounded-xl border px-4 text-sm font-semibold"><Plus className="mr-1 h-4 w-4" />Agregar fila</button>
        </Card>
      ) : (
        <Card>
          <label className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed p-8 text-center">
            <ImageUp className="h-10 w-10 text-primary" />
            <span className="font-semibold">Toca para subir la foto de tu lista</span>
            <span className="text-xs text-muted-foreground">Imagen, PDF o archivo de texto</span>
            <input type="file" accept="image/*,.pdf,.txt,.doc,.docx" className="hidden" onChange={(e) => { const x = e.target.files?.[0]; if (x) { if (file?.url) URL.revokeObjectURL(file.url); setFile({ raw: x, name: x.name, url: x.type.startsWith("image/") ? URL.createObjectURL(x) : undefined }); } }} />
          </label>
          {file && <div className="mt-3 rounded-xl bg-muted p-3 text-sm">{file.url && <img src={file.url} alt="Vista previa de la lista" className="mb-2 max-h-64 rounded-lg" />}📎 {file.name}</div>}
        </Card>
      )}
      {err.items && <p className="text-sm text-destructive">{err.items}</p>}
      <Card className="grid gap-3 md:grid-cols-2">
        <Field label="Nombre del negocio / bodega" required error={err.business}><input className={inputCls} value={f.business} onChange={(e) => setF({ ...f, business: e.target.value })} /></Field>
        <Field label="Nombre del responsable" required error={err.contact}><input className={inputCls} value={f.contact} onChange={(e) => setF({ ...f, contact: e.target.value })} /></Field>
        <Field label="Teléfono / WhatsApp" required error={err.phone}><input className={inputCls} inputMode="tel" placeholder="9XXXXXXXX" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} /></Field>
        <Field label="Zona"><select className={inputCls} value={f.zone} onChange={(e) => setF({ ...f, zone: e.target.value })}>{ZONES.map((z) => <option key={z}>{z}</option>)}</select></Field>
        <Field label="Dirección del negocio" required error={err.address}><input className={inputCls} value={f.address} onChange={(e) => setF({ ...f, address: e.target.value })} /></Field>
        <Field label="Fecha y hora deseada de recepción" required error={err.date}><input type="datetime-local" className={inputCls} value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} /></Field>
      </Card>
      <Button onClick={submit} disabled={sending} className="h-14 w-full whitespace-normal rounded-xl text-lg font-semibold">{sending ? "Enviando..." : "Enviar solicitud de cotización"}</Button>
    </div>
  );
}
