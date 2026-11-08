import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { priceSchema, phoneSchema, optionalPhoneSchema, personSchema, businessSchema, photoSchema, digits } from "@/lib/validation";
import { ValidatedInput } from "@/components/ValidatedInput";
import { useState } from "react";
import { toast } from "sonner";
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Lock, Pause, Play, Plus, Trash2 } from "lucide-react";
import { ZONES, soles, type Vendor, type Availability, type Product } from "@/lib/data";
import { addProduct, addVendor, bulkPrice, deleteProduct, deleteVendor, patchProduct, patchSettings, patchVendor, uploadImage, useCatalog } from "@/lib/catalog";
import { Photo } from "@/components/ProductCard";
import { STATUS_FLOW, STATUS_LABEL, useStore, type Order, type OrderStatus } from "@/lib/store";
import { useAdmin, useAllOrders, useOrderMutations } from "@/lib/orders";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, inputCls } from "@/components/Field";
import { AdminPhotos } from "@/components/PhotoApproval";
import { useServerFn } from "@tanstack/react-start";
import { loginWithAdminKey } from "@/lib/admin-key.functions";
import { Experimento2 } from "@/components/Experimento2";
import { AdminRequests } from "@/components/AdminRequests";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: [
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
    { title: "Panel de operaciones — Mercantista" },
    { name: "description", content: "Gestión de puestos, precios diarios, pedidos, tarifas y costos operativos." },
    { property: "og:title", content: "Panel de operaciones — Mercantista" },
    { property: "og:description", content: "Operación diaria de Mercantista en Unicachi." },
    { name: "robots", content: "noindex" },
  ] }),
  component: Admin,
});

function Login() {
  const [key, setKey] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const login = useServerFn(loginWithAdminKey);
  const go = async () => {
    const r = z.string().min(1, "Ingresa la clave").max(200, "Máximo 200 caracteres").safeParse(key);
    if (!r.success) { setError(r.error.issues[0]?.message ?? "Clave inválida"); return; }
    setError("");
    setBusy(true);
    try { const t = await login({ data: { key } }); await supabase.auth.setSession(t); setKey(""); }
    catch { setError("Clave incorrecta"); } finally { setBusy(false); }
  };
  return (
    <Card className="mx-auto max-w-sm space-y-3 text-center">
      <Lock className="mx-auto h-10 w-10 text-primary" /><h1 className="text-2xl font-bold">Panel administrativo</h1>
      <p className="text-sm text-muted-foreground">Ingresa la clave del operador.</p>
      <input type="password" autoComplete="off" placeholder="Clave" className={inputCls} value={key} onChange={(e) => setKey(e.target.value)} onKeyDown={(e) => e.key === "Enter" && go()} />
      {error && <p role="alert" className="text-xs text-destructive">{error}</p>}
      <button disabled={busy} className="h-11 w-full rounded-xl bg-primary font-semibold text-primary-foreground disabled:opacity-60" onClick={go}>{busy ? "Verificando..." : "Ingresar"}</button>
    </Card>
  );
}

function Admin() {
  const a = useAdmin();
  const { signOut } = useAuth();
  if (a.loading) return <p className="text-center text-muted-foreground">Cargando...</p>;
  if (!a.email) return <Login />;
  if (!a.isAdmin) return (
    <Card className="mx-auto max-w-sm space-y-3 text-center">
      <p className="font-semibold">{a.email} no tiene permisos de administrador.</p>
      <button className="h-11 w-full rounded-xl border font-semibold" onClick={() => void signOut()}>Cerrar sesión</button>
    </Card>
  );
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2"><h1 className="text-3xl font-bold">Panel de operaciones</h1><button className="rounded-lg border px-3 py-1.5 text-sm" onClick={() => void signOut()}>Cerrar sesión</button></div>
      <Tabs defaultValue="resumen">
        <TabsList className="h-auto flex-wrap">
          {["resumen", "pedidos", "productos", "puestos", "tarifas", "reportes"].map((t) => <TabsTrigger key={t} value={t} className="capitalize">{t}</TabsTrigger>)}
          <TabsTrigger value="exp2">Experimento 2</TabsTrigger>
          <TabsTrigger value="solicitudes">Solicitudes</TabsTrigger>
        </TabsList>
        <TabsContent value="resumen"><Resumen /></TabsContent>
        <TabsContent value="pedidos"><Pedidos /></TabsContent>
        <TabsContent value="productos"><Productos /></TabsContent>
        <TabsContent value="puestos"><Puestos /></TabsContent>
        <TabsContent value="tarifas"><Tarifas /></TabsContent>
        <TabsContent value="reportes"><Reportes /></TabsContent>
        <TabsContent value="exp2"><Experimento2 /></TabsContent>
        <TabsContent value="solicitudes"><AdminRequests /></TabsContent>
      </Tabs>
    </div>
  );
}

function Stat({ l, v }: { l: string; v: string }) { return <Card><p className="text-sm text-muted-foreground">{l}</p><p className="font-display text-2xl font-bold">{v}</p></Card>; }

function Resumen() {
  const orders = (useAllOrders().data ?? []).filter((o) => o.status !== "cancelled");
  const { vendors } = useCatalog();
  const active = orders.filter((o) => o.status !== "delivered");
  const byStatus = STATUS_FLOW.map((s) => ({ name: STATUS_LABEL[s].split(" ")[0], pedidos: orders.filter((o) => o.status === s).length }));
  const visit = vendors.map((v) => ({ v, items: active.flatMap((o) => o.items.filter((i) => i.vendorId === v.id)) })).filter((x) => x.items.length);
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat l="Pedidos activos" v={String(active.length)} />
        <Stat l="Kg proyectados" v={`${active.reduce((s, o) => s + o.weightKg, 0)} kg`} />
        <Stat l="Bultos" v={String(active.reduce((s, o) => s + o.packages, 0))} />
        <Stat l="Ingresos por servicio" v={soles(orders.reduce((s, o) => s + o.serviceFee + o.shippingFee, 0))} />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Card><p className="mb-2 font-semibold">Pedidos por estado</p><ResponsiveContainer width="100%" height={220}><BarChart data={byStatus}><CartesianGrid strokeDasharray="3 3" stroke="var(--border)" /><XAxis dataKey="name" fontSize={11} /><YAxis allowDecimals={false} /><Tooltip /><Bar dataKey="pedidos" fill="var(--primary)" radius={6} /></BarChart></ResponsiveContainer></Card>
        <Card>
          <p className="mb-2 font-semibold">Por tipo de entrega</p>
          {(["taxi_delivery", "minivan_delivery"] as const).map((s) => <div key={s} className="flex justify-between border-b py-2 text-sm"><span>{s === "taxi_delivery" ? "Entrega tipo 1 · Compra y subida a tu taxi" : "Entrega tipo 2 · Hasta tu bodega o almacén"}</span><b>{orders.filter((o) => o.service === s).length} pedidos</b></div>)}
          <p className="mb-2 mt-4 font-semibold">Puestos a visitar hoy</p>
          {visit.map(({ v, items }) => <div key={v.id} className="flex justify-between py-1 text-sm"><span>{v.stall} · {v.name}</span><b>{items.reduce((s, i) => s + i.qty, 0)} bultos</b></div>)}
        </Card>
      </div>
    </div>
  );
}

function Pedidos() {
  const q = useAllOrders();
  const orders = q.data ?? [];
  const m = useOrderMutations();
  const { vendors } = useCatalog();
  const [st, setSt] = useState("");
  const [sv, setSv] = useState("");
  const [date, setDate] = useState("");
  const [open, setOpen] = useState<Order | null>(null);
  const list = orders.filter((o) => (!st || o.status === st) && (!sv || o.service === sv) && (!date || o.deliveryDate === date));
  const live = open && orders.find((o) => o.code === open.code);
  return (
    <Card className="space-y-3">
      <div className="grid gap-2 md:grid-cols-3">
        <select className={inputCls} value={st} onChange={(e) => setSt(e.target.value)}><option value="">Todos los estados</option>{[...STATUS_FLOW, "cancelled" as const].map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}</select>
        <select className={inputCls} value={sv} onChange={(e) => setSv(e.target.value)}><option value="">Todas las entregas</option><option value="taxi_delivery">Entrega tipo 1 · Compra y subida a tu taxi</option><option value="minivan_delivery">Entrega tipo 2 · Hasta tu bodega o almacén</option></select>
        <input type="date" className={inputCls} value={date} onChange={(e) => setDate(e.target.value)} />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-muted-foreground"><tr><th className="p-2">Código</th><th className="p-2">Bodega</th><th className="p-2">Entrega</th><th className="p-2">Total</th><th className="p-2">Estado</th></tr></thead>
          <tbody>{list.map((o) => (
            <tr key={o.code} className="border-t">
              <td className="p-2"><button className="font-semibold text-primary" onClick={() => setOpen(o)}>{o.code}</button></td>
              <td className="p-2">{o.business}</td><td className="p-2">{o.service === "taxi_delivery" ? "Entrega tipo 1 · Compra y subida a tu taxi" : "Entrega tipo 2 · Hasta tu bodega o almacén"}</td><td className="p-2 tabular-nums">{soles(o.total)}</td>
              <td className="p-2"><select className="h-9 rounded-lg border bg-card px-2" value={o.status} onChange={(e) => { const ns = e.target.value as OrderStatus; m.setStatus(o, ns).then(() => toast.success(`${o.code}: ${STATUS_LABEL[ns]}`), () => toast.error("No se pudo cambiar el estado")); }}>{[...STATUS_FLOW, "cancelled" as const].map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}</select></td>
            </tr>
          ))}</tbody>
        </table>
        {q.isLoading && <p className="p-6 text-center text-muted-foreground">Cargando pedidos...</p>}
        {!q.isLoading && list.length === 0 && <p className="p-6 text-center text-muted-foreground">Sin pedidos con esos filtros.</p>}
      </div>
      <Dialog open={!!live} onOpenChange={() => setOpen(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto rounded-2xl">
          {live && <>
            <DialogHeader><DialogTitle>{live.code} · {live.business}</DialogTitle></DialogHeader>
            <p className="font-semibold">Lista de compra para el comprador</p>
            {vendors.filter((v) => live.items.some((i) => i.vendorId === v.id)).map((v) => (
              <div key={v.id} className="rounded-xl bg-muted p-3 text-sm"><p className="font-semibold">{v.stall} · {v.name}</p>
                {live.items.filter((i) => i.vendorId === v.id).map((i, idx) => (
                  <div key={idx} className="mt-1 flex items-center justify-between gap-2"><span>{i.qty} × {i.name} {i.note && <em className="text-muted-foreground">({i.note})</em>}</span>
                    <ValidatedInput type="number" step="0.5" inputMode="decimal" aria-label="Precio real" className="h-8 w-24 rounded-lg border bg-card px-2 text-right" value={i.unitPrice} schema={priceSchema} onCommit={(v) => { const price = Number(v); if (price !== i.unitPrice) void m.setItemPrice(live, live.items.indexOf(i), price).then(() => toast.success("Precio actualizado"), saveErr); }} />
                  </div>
                ))}
              </div>
            ))}
            <p className="text-xs text-muted-foreground">Ajusta el precio unitario real comprado y sal del campo para guardar; el total se recalcula.</p>
            <AdminPhotos o={live} />
            {live.taxi ? <div className="rounded-xl border p-3 text-sm"><p className="font-semibold">Taxi de confianza</p>{live.taxi.driver} · {live.taxi.plate} · {live.taxi.phone}<br />Llega {live.taxi.arrival} a {live.taxi.meeting}</div>
              : <div className="rounded-xl border p-3 text-sm"><p className="font-semibold">Hoja de ruta van compartida</p>Unicachi → {live.zone} · {live.address}<br />{live.slot} · {live.weightKg} kg / {live.packages} bultos · Contacto {live.phone}</div>}
            <p className="text-right text-lg font-bold">Total {soles(live.total)}</p>
          </>}
        </DialogContent>
      </Dialog>
    </Card>
  );
}

function ImgUpload({ kind, id, src, name }: { kind: "products" | "categories"; id: string; src: string | null; name: string }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  return (
    <label className="flex cursor-pointer items-center gap-2" title="Cambiar foto">
      <Photo src={src} name={busy ? "Subiendo..." : "Sin foto"} className="h-12 w-12 text-[10px]" />
      <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={async (e) => {
        const f = e.target.files?.[0]; if (!f) return; const result = photoSchema.safeParse(f); if (!result.success) { setError(result.error.issues[0]?.message ?? "Foto inválida"); return; } setError(""); setBusy(true);
        const ok = await uploadImage(kind, id, f).catch(() => false); setBusy(false);
        ok ? toast.success(`Foto de ${name} guardada`) : toast.error("No se pudo subir la foto");
      }} />
      {error && <span role="alert" className="text-xs text-destructive">{error}</span>}
    </label>
  );
}

const saveErr = () => toast.error("No se pudo guardar el cambio");

function Productos() {
  const { products, vendors, categories } = useCatalog();
  const [pct, setPct] = useState(5);
  const patch = (id: string, p: Partial<Product>) => patchProduct(id, p, saveErr);
  const bulk = async (sign: 1 | -1) => { const ok = await bulkPrice(sign * pct); ok ? toast.success(`Precios ${sign > 0 ? "subidos" : "bajados"} ${pct}%`) : saveErr(); };
  const add = async () => { if (!vendors[0]) return; (await addProduct(vendors[0].id)) ? toast.success("Producto agregado") : saveErr(); };
  return (
    <div className="space-y-4">
    <Card className="space-y-2">
      <p className="font-semibold">Fotos de categorías</p>
      <div className="flex flex-wrap gap-3">{categories.map((c) => <div key={c.id} className="flex items-center gap-2 rounded-xl bg-muted p-2 text-sm"><ImgUpload kind="categories" id={c.id} src={c.image} name={c.name} />{c.name}</div>)}</div>
    </Card>
    <Card className="space-y-3">
      <div className="flex flex-wrap items-center gap-2 rounded-xl bg-muted p-3 text-sm">
        <span className="font-semibold">Actualización masiva (04:00 am):</span>
        <ValidatedInput type="number" className="h-9 w-20 rounded-lg border bg-card px-2" value={pct} schema={z.number().min(0, "Mínimo 0%").max(99, "Máximo 99%")} onCommit={(v) => setPct(Number(v))} />%
        <button className="h-9 rounded-lg bg-primary px-3 text-primary-foreground" onClick={() => bulk(1)}>Subir</button>
        <button className="h-9 rounded-lg border bg-card px-3" onClick={() => bulk(-1)}>Bajar</button>
        <button className="ml-auto inline-flex h-9 items-center rounded-lg border bg-card px-3" onClick={add}><Plus className="mr-1 h-4 w-4" />Producto</button>
      </div>
      <div className="overflow-x-auto"><table className="w-full text-sm">
        <thead className="text-left text-muted-foreground"><tr><th className="p-2">Foto</th><th className="p-2">Producto</th><th className="p-2">Presentación</th><th className="p-2">Categoría</th><th className="p-2">Puesto</th><th className="p-2">Precio S/</th><th className="p-2">Disponibilidad</th><th className="p-2">Visible</th><th /></tr></thead>
        <tbody>{products.map((p) => (
          <tr key={p.id} className={`border-t ${p.active ? "" : "opacity-60"}`}>
            <td className="p-2"><ImgUpload kind="products" id={p.id} src={p.image} name={p.name} /></td>
            <td className="p-2"><ValidatedInput className="h-9 w-48 rounded-lg border bg-card px-2" value={p.name} schema={z.string().trim().min(1, "Escribe el producto").max(200, "Máximo 200 caracteres")} onCommit={(v) => patch(p.id, { name: v })} /></td>
            <td className="p-2"><ValidatedInput className="h-9 w-40 rounded-lg border bg-card px-2" value={p.unit} schema={z.string().trim().min(1, "Escribe la presentación").max(100, "Máximo 100 caracteres")} onCommit={(v) => patch(p.id, { unit: v })} /></td>
            <td className="p-2"><select className="h-9 rounded-lg border bg-card px-2" value={p.category} onChange={(e) => patch(p.id, { category: e.target.value })}><option value="">Otros</option>{categories.map((c) => <option key={c.id} value={c.id}>{c.name.split(",")[0]}</option>)}</select></td>
            <td className="p-2"><select className="h-9 rounded-lg border bg-card px-2" value={p.vendorId} onChange={(e) => patch(p.id, { vendorId: e.target.value })}>{vendors.map((v) => <option key={v.id} value={v.id}>{v.stall}</option>)}</select></td>
            <td className="p-2"><ValidatedInput type="number" step="0.5" className="h-9 w-24 rounded-lg border bg-card px-2" value={p.price} schema={priceSchema} onCommit={(v) => patch(p.id, { price: Number(v) })} /></td>
            <td className="p-2"><select className="h-9 rounded-lg border bg-card px-2" value={p.availability} onChange={(e) => patch(p.id, { availability: e.target.value as Availability })}><option value="disponible">Disponible hoy</option><option value="agotado">Agotado en Unicachi</option><option value="por_confirmar">Precio por confirmar</option></select></td>
            <td className="p-2"><input type="checkbox" className="h-5 w-5" checked={p.active} onChange={(e) => patch(p.id, { active: e.target.checked })} /></td>
            <td className="p-2"><button aria-label="Eliminar" onClick={async () => { if (confirm(`¿Eliminar ${p.name}?`)) (await deleteProduct(p.id)) || saveErr(); }}><Trash2 className="h-4 w-4" /></button></td>
          </tr>
        ))}</tbody>
      </table></div>
    </Card>
    </div>
  );
}

function Puestos() {
  const { vendors } = useCatalog();
  const patch = (id: string, p: Partial<Vendor>) => patchVendor(id, p, saveErr);
  const add = async () => { (await addVendor()) ? toast.success("Puesto agregado") : saveErr(); };
  return (
    <div className="space-y-3">
      <button className="inline-flex h-10 items-center rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground" onClick={add}><Plus className="mr-1 h-4 w-4" />Nuevo puesto</button>
      <div className="grid gap-3 md:grid-cols-2">{vendors.map((v) => (
        <Card key={v.id} className={`grid grid-cols-2 gap-2 text-sm ${v.active ? "" : "opacity-60"}`}>
          {([["name", "Nombre"], ["stall", "Número"], ["pavilion", "Pabellón"], ["contact", "Responsable"], ["phone", "Teléfono"], ["schedule", "Horario"], ["specialty", "Especialidad"]] as const).map(([k, l]) => (
            <label key={k} className={k === "specialty" ? "col-span-2" : ""}><span className="text-xs text-muted-foreground">{l}</span><ValidatedInput className="h-9 w-full rounded-lg border bg-card px-2" inputMode={k === "phone" ? "numeric" : "text"} maxLength={k === "phone" ? 9 : undefined} transform={k === "phone" ? digits : undefined} value={v[k]} schema={k === "phone" ? optionalPhoneSchema : k === "contact" ? z.union([z.literal(""), personSchema]) : k === "name" ? businessSchema : z.string().max(200, "Máximo 200 caracteres")} onCommit={(value) => patch(v.id, { [k]: value })} /></label>
          ))}
          <div className="col-span-2 flex gap-2">
            <button className="inline-flex h-9 items-center rounded-lg border px-3" onClick={() => patch(v.id, { active: !v.active })}>{v.active ? <><Pause className="mr-1 h-4 w-4" />Pausar</> : <><Play className="mr-1 h-4 w-4" />Activar</>}</button>
            <button className="inline-flex h-9 items-center rounded-lg border px-3" onClick={() => patch(v.id, { verified: !v.verified })}>{v.verified ? "Quitar verificado" : "Verificar"}</button>
            <button className="ml-auto inline-flex h-9 items-center rounded-lg border px-3 text-destructive" onClick={async () => { if (confirm(`¿Eliminar ${v.name} y sus productos?`)) (await deleteVendor(v.id)) || saveErr(); }}><Trash2 className="h-4 w-4" /></button>
          </div>
        </Card>
      ))}</div>
    </div>
  );
}

function Tarifas() {
  const t = useCatalog().tariffs;
  const set = (p: Partial<typeof t>) => patchSettings(p, saveErr);
  return (
    <div className="space-y-4">
      <Card className="grid gap-3 md:grid-cols-3">
        <label className="text-sm"><span className="text-muted-foreground">Entrega tipo 1 · Compra y subida a tu taxi: fijo por pedido S/</span><ValidatedInput type="number" className={inputCls} value={t.taxiFlat} schema={priceSchema} onCommit={(v) => set({ taxiFlat: Number(v) })} /></label>
        <label className="text-sm"><span className="text-muted-foreground">WhatsApp de atención</span><ValidatedInput className={inputCls} inputMode="numeric" maxLength={9} value={t.whatsapp.replace(/^51/, "")} transform={digits} schema={phoneSchema} onCommit={(v) => set({ whatsapp: `51${v}` })} placeholder="9XXXXXXXX" /></label>
      </Card>
      <Card className="overflow-x-auto">
        <table className="w-full text-sm"><thead className="text-left text-muted-foreground"><tr><th className="p-2">Entrega tipo 2 · Hasta tu bodega o almacén</th><th className="p-2">Hasta 200 kg</th><th className="p-2">Hasta 450 kg</th><th className="p-2">Hasta 750 kg</th></tr></thead>
          <tbody>{([1, 2] as const).map((n) => <tr key={n} className="border-t"><td className="p-2"><p className="text-xs text-muted-foreground">{ZONES.filter((z) => t.zoneTramo[z] === n).join(", ")}</p></td>{t.tramos[n].map((p, i) => <td key={i} className="p-2"><ValidatedInput type="number" step="0.5" className="h-9 w-24 rounded-lg border bg-card px-2" value={p} schema={priceSchema} onCommit={(v) => { const arr = [...t.tramos[n]] as [number, number, number]; arr[i] = Number(v); set({ tramos: { ...t.tramos, [n]: arr } }); }} /></td>)}</tr>)}</tbody>
        </table>
      </Card>
    </div>
  );
}

function Reportes() {
  const costs = useStore((s) => s.costs);
  const orders = (useAllOrders().data ?? []).filter((o) => o.service === "minivan_delivery");
  const income = orders.reduce((s, o) => s + o.serviceFee + o.shippingFee, 0);
  const data = costs.map((c, i) => { const cost = c.fuel + c.driver + c.maintenance + c.other + 12; const ing = 160 + ((i * 37) % 90); return { dia: c.date, costos: cost, ingresos: ing, margen: ing - cost }; });
  const avg = data.reduce((s, d) => s + d.margen, 0) / data.length;
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        <Stat l="Margen promedio diario van" v={soles(avg)} />
        <Stat l="Ingresos van (pedidos actuales)" v={soles(income)} />
        <Stat l="Costo diario promedio" v={soles(data.reduce((s, d) => s + d.costos, 0) / data.length)} />
      </div>
      <Card><p className="mb-2 font-semibold">Costos operativos vs ingresos (incluye depreciación S/ 12/día)</p>
        <ResponsiveContainer width="100%" height={260}><LineChart data={data}><CartesianGrid strokeDasharray="3 3" stroke="var(--border)" /><XAxis dataKey="dia" /><YAxis /><Tooltip /><Legend /><Line dataKey="ingresos" stroke="var(--success)" strokeWidth={2} /><Line dataKey="costos" stroke="var(--primary)" strokeWidth={2} /><Line dataKey="margen" stroke="var(--foreground)" strokeDasharray="4 4" /></LineChart></ResponsiveContainer>
      </Card>
    </div>
  );
}
