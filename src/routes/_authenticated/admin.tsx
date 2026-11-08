import { createFileRoute, Link, useRouter, type ErrorComponentProps } from "@tanstack/react-router";
import { DataSkeleton, ConnectionError } from "@/components/DataState";
import { z } from "zod";
import { priceSchema, phoneSchema, optionalPhoneSchema, personSchema, businessSchema, digits } from "@/lib/validation";
import { ValidatedInput } from "@/components/ValidatedInput";
import { useState } from "react";
import { toast } from "sonner";
import { useSuspenseQuery } from "@tanstack/react-query";
import { adminDashboardOptions, requireAdminRole } from "@/lib/admin";
import { AdminCategories, AdminImageUpload as ImgUpload, ProductEditor, VendorEditor } from "@/components/AdminCatalogForms";
import { Button } from "@/components/ui/button";
import { BatchPhotoUpload } from "@/components/BatchPhotoUpload";
import { pendingProductPriceSchema, photoTypeLabel, type PhotoType } from "@/lib/catalog-photos";
import { Pause, Play, Plus, Trash2, Pencil, MessageCircle } from "lucide-react";
import { ZONES, soles, type Vendor, type Availability, type Product } from "@/lib/data";
import { bulkPrice, deleteProduct, patchProduct, patchSettings, patchVendor, useCatalog } from "@/lib/catalog";
import { STATUS_FLOW, STATUS_LABEL, type Order, type OrderStatus } from "@/lib/store";
import { useAllOrders, useOrderMutations } from "@/lib/orders";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, Field, inputCls } from "@/components/Field";
import { AdminPhotos } from "@/components/PhotoApproval";
import { Experimento2 } from "@/components/Experimento2";
import { AdminRequests } from "@/components/AdminRequests";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/_authenticated/admin")({
  beforeLoad: async () => { await requireAdminRole(); },
  loader: ({ context }) => context.queryClient.ensureQueryData(adminDashboardOptions),
  errorComponent: AdminError,
  notFoundComponent: () => <p>Panel no disponible</p>,
  pendingComponent: DataSkeleton,
  head: () => ({ meta: [
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
    { title: "Panel de operaciones — Mercantista" },
    { name: "description", content: "Gestión de puestos, precios diarios, pedidos, tarifas y resultados reales." },
    { property: "og:title", content: "Panel de operaciones — Mercantista" },
    { property: "og:description", content: "Operación diaria de Mercantista en Unicachi." },
    { name: "robots", content: "noindex" },
  ] }),
  component: Admin,
});

function AdminError({ error, reset }: ErrorComponentProps) {
  const router = useRouter();
  if (!(error instanceof Error) || error.message !== "No tienes permisos de administrador") return <ConnectionError retry={async () => { await router.invalidate(); reset(); }} />;
  return <div className="space-y-4 py-10 text-center"><h1 className="text-2xl font-bold">Acceso restringido</h1><p>Esta cuenta no tiene permisos de administrador.</p><Button asChild variant="outline"><Link to="/cuenta">Ir a mi cuenta</Link></Button></div>;
}

function Admin() {
  const { signOut } = useAuth();
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2"><h1 className="text-3xl font-bold">Panel de operaciones</h1><Button className="rounded-lg border px-3 py-1.5 text-sm" onClick={() => void signOut()}>Cerrar sesión</Button></div>
      <Tabs defaultValue="resumen">
        <TabsList className="h-auto flex-wrap">
          {["resumen", "pedidos", "productos", "categorías", "puestos", "tarifas"].map((t) => <TabsTrigger key={t} value={t} className="capitalize">{t}</TabsTrigger>)}
          <TabsTrigger value="exp2">Experimento 2</TabsTrigger>
          <TabsTrigger value="solicitudes">Solicitudes</TabsTrigger>
        </TabsList>
        <TabsContent value="resumen"><Resumen /></TabsContent>
        <TabsContent value="pedidos"><Pedidos /></TabsContent>
        <TabsContent value="productos"><Productos /></TabsContent>
        <TabsContent value="puestos"><Puestos /></TabsContent>
        <TabsContent value="tarifas"><Tarifas /></TabsContent>
        <TabsContent value="categorías"><AdminCategories /></TabsContent>
        <TabsContent value="exp2"><Experimento2 /></TabsContent>
        <TabsContent value="solicitudes"><AdminRequests /></TabsContent>
      </Tabs>
    </div>
  );
}

function Stat({ l, v }: { l: string; v: string }) { return <Card><p className="text-sm text-muted-foreground">{l}</p><p className="font-display text-2xl font-bold">{v}</p></Card>; }

function Resumen() {
  const { data } = useSuspenseQuery(adminDashboardOptions);
  if (!data.totalOrders) return <section className="py-16 text-center"><h2 className="text-xl font-bold">Resumen</h2><p className="mt-4 text-muted-foreground">Aún no hay datos</p></section>;
  return <section className="space-y-8"><div className="grid grid-cols-2 gap-3 lg:grid-cols-3"><Stat l="Pedidos de hoy" v={String(data.today)} /><Stat l="Pedidos de esta semana" v={String(data.week)} /><Stat l="Ventas acumuladas" v={soles(data.revenue)} /><Stat l="Ingresos cobrados" v={soles(data.collected)} /><Stat l="Ticket promedio" v={soles(data.average)} /><Stat l="Clientes activos · 30 días" v={String(data.clients)} /></div><div className="grid gap-8 md:grid-cols-2"><div><h2 className="mb-3 text-lg font-bold">Productos más pedidos</h2>{data.top.length ? data.top.map((p) => <div key={p.id} className="flex justify-between gap-4 border-b py-3 text-sm"><span>{p.name}</span><b>{p.units} unidades</b></div>) : <p className="text-muted-foreground">Aún no hay datos</p>}</div><div><h2 className="mb-3 text-lg font-bold">Esta semana</h2>{data.days.length ? <table className="w-full text-sm"><thead><tr className="text-left text-muted-foreground"><th className="py-2">Fecha</th><th>Pedidos</th><th className="text-right">Ventas</th></tr></thead><tbody>{data.days.map((d) => <tr key={d.date} className="border-t"><td className="py-3">{d.date}</td><td>{d.orders}</td><td className="text-right">{soles(d.sales)}</td></tr>)}</tbody></table> : <p className="text-muted-foreground">Aún no hay datos</p>}</div></div></section>;
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
        <select aria-label="Filtrar por estado" className={inputCls} value={st} onChange={(e) => setSt(e.target.value)}><option value="">Todos los estados</option>{[...STATUS_FLOW, "cancelled" as const].map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}</select>
        <select aria-label="Filtrar por tipo de entrega" className={inputCls} value={sv} onChange={(e) => setSv(e.target.value)}><option value="">Todas las entregas</option><option value="taxi_delivery">Entrega tipo 1 · Compra y subida a tu taxi</option><option value="minivan_delivery">Entrega tipo 2 · Hasta tu bodega o almacén</option></select>
        <input aria-label="Filtrar por fecha de entrega" type="date" className={inputCls} value={date} onChange={(e) => setDate(e.target.value)} />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-muted-foreground"><tr><th className="p-2">Código</th><th className="p-2">Cliente</th><th className="p-2">Entrega</th><th className="p-2">Total</th><th className="p-2">Estado</th></tr></thead>
          <tbody>{list.map((o) => (
            <tr key={o.code} className="border-t">
              <td className="p-2"><Button variant="link" className="h-auto p-0 font-semibold" onClick={() => setOpen(o)}>{o.code}</Button></td>
              <td className="p-2"><p className="font-semibold">{o.business}</p><p>{o.contact}</p><a className="inline-flex items-center gap-1 text-primary" href={customerWhatsapp(o.phone, o.code)} target="_blank" rel="noreferrer"><MessageCircle className="h-4 w-4" />{o.phone}</a></td><td className="p-2">{o.service === "taxi_delivery" ? "Entrega tipo 1 · Compra y subida a tu taxi" : "Entrega tipo 2 · Hasta tu bodega o almacén"}</td><td className="p-2 tabular-nums">{soles(o.total)}</td>
              <td className="p-2"><select className="h-9 rounded-lg border bg-card px-2" value={o.status} onChange={(e) => { const ns = e.target.value as OrderStatus; m.setStatus(o, ns).then(() => toast.success(`${o.code}: ${STATUS_LABEL[ns]}`), () => toast.error("No se pudo cambiar el estado")); }}>{[...STATUS_FLOW, "cancelled" as const].map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}</select></td>
            </tr>
          ))}</tbody>
        </table>
        {q.isLoading && <DataSkeleton />}
        {q.isError && <ConnectionError retry={q.refetch} />}
        {!q.isLoading && !q.isError && list.length === 0 && <p className="p-6 text-center text-muted-foreground">Aún no hay datos</p>}
      </div>
      <Dialog open={!!live} onOpenChange={() => setOpen(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto rounded-2xl">
          {live && <>
            <DialogHeader><DialogTitle>{live.code} · {live.business}</DialogTitle></DialogHeader>
            <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="font-semibold">{live.contact}</p><p>{live.phone}</p></div><Button asChild variant="outline"><a href={customerWhatsapp(live.phone, live.code)} target="_blank" rel="noreferrer"><MessageCircle />WhatsApp</a></Button></div>
            <Field label="Estado del pedido"><select className={inputCls} value={live.status} onChange={(e) => void m.setStatus(live, e.target.value as OrderStatus).catch(saveErr)}>{[...STATUS_FLOW, "cancelled" as const].map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}</select></Field>
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

const customerWhatsapp = (phone: string, code: string) => phoneSchema.safeParse(phone).success ? `https://wa.me/51${phone}?text=${encodeURIComponent(`Hola, te contactamos por tu pedido ${code}`)}` : "#";

const saveErr = () => toast.error("No se pudo guardar el cambio");

function Productos() {
  const { products, vendors, categories } = useCatalog();
  const [pct, setPct] = useState(5);
  const [editor, setEditor] = useState<Product | null | undefined>(undefined);
  const patch = (id: string, p: Partial<Product>) => patchProduct(id, p, saveErr);
  const bulk = async (sign: 1 | -1) => { const ok = await bulkPrice(sign * pct); ok ? toast.success(`Precios ${sign > 0 ? "subidos" : "bajados"} ${pct}%`) : saveErr(); };
  const add = () => setEditor(null);
  return (
    <div className="space-y-4">
    <BatchPhotoUpload kind="products" />
    {editor !== undefined && <ProductEditor product={editor} onClose={() => setEditor(undefined)} />}
    <Card className="space-y-3">
      <div className="flex flex-wrap items-center gap-2 rounded-xl bg-muted p-3 text-sm">
        <span className="font-semibold">Actualización masiva (04:00 am):</span>
        <ValidatedInput type="number" className="h-9 w-20 rounded-lg border bg-card px-2" value={pct} schema={z.number().min(0, "Mínimo 0%").max(99, "Máximo 99%")} onCommit={(v) => setPct(Number(v))} />%
        <Button className="h-9 rounded-lg bg-primary px-3 text-primary-foreground" onClick={() => bulk(1)}>Subir</Button>
        <Button className="h-9 rounded-lg border bg-card px-3" onClick={() => bulk(-1)}>Bajar</Button>
        <Button className="ml-auto inline-flex h-9 items-center rounded-lg border bg-card px-3" onClick={add}><Plus className="mr-1 h-4 w-4" />Producto</Button>
      </div>
      <div className="overflow-x-auto"><table className="w-full text-sm">
        <thead className="text-left text-muted-foreground"><tr><th className="p-2">Foto</th><th className="p-2">Producto</th><th className="p-2">Presentación</th><th className="p-2">Categoría</th><th className="p-2">Puesto</th><th className="p-2">Precio S/</th><th className="p-2">Disponibilidad</th><th className="p-2">Visible</th><th /></tr></thead>
        <tbody>{products.map((p) => (
          <tr key={p.id} className={`border-t ${p.active ? "" : "opacity-60"}`}>
            <td className="p-2"><ImgUpload kind="products" id={p.id} src={p.image} name={p.name} photoType={p.photoType} /><select aria-label={`Tipo de foto de ${p.name}`} className="mt-2 h-11 rounded-lg border bg-card px-2" value={p.photoType ?? ""} onChange={(e) => patch(p.id, { photoType: e.target.value as PhotoType })}><option value="" disabled>Tipo de foto</option>{(["puesto", "referencial"] as const).map((v) => <option key={v} value={v}>{photoTypeLabel(v)}</option>)}</select></td>
            <td className="p-2"><ValidatedInput className="h-9 w-48 rounded-lg border bg-card px-2" value={p.name} schema={z.string().trim().min(1, "Escribe el producto").max(200, "Máximo 200 caracteres")} onCommit={(v) => patch(p.id, { name: v })} /></td>
            <td className="p-2"><ValidatedInput className="h-9 w-40 rounded-lg border bg-card px-2" value={p.unit} schema={z.string().trim().min(1, "Escribe la presentación").max(100, "Máximo 100 caracteres")} onCommit={(v) => patch(p.id, { unit: v })} /></td>
            <td className="p-2"><select className="h-9 rounded-lg border bg-card px-2" value={p.category} onChange={(e) => patch(p.id, { category: e.target.value })}><option value="">Otros</option>{categories.map((c) => <option key={c.id} value={c.id}>{c.name.split(",")[0]}</option>)}</select></td>
            <td className="p-2"><select className="h-9 rounded-lg border bg-card px-2" value={p.vendorId} onChange={(e) => patch(p.id, { vendorId: e.target.value })}>{vendors.map((v) => <option key={v.id} value={v.id}>{v.stall}</option>)}</select></td>
            <td className="p-2"><ValidatedInput type="number" step="0.5" className="h-9 w-24 rounded-lg border bg-card px-2" value={p.price} schema={p.availability === "por_confirmar" ? pendingProductPriceSchema : priceSchema} onCommit={(v) => patch(p.id, { price: Number(v) })} /></td>
            <td className="p-2"><select className="h-9 rounded-lg border bg-card px-2" value={p.availability} onChange={(e) => patch(p.id, { availability: e.target.value as Availability })}><option value="disponible">Disponible hoy</option><option value="agotado">Agotado en Unicachi</option><option value="por_confirmar">Precio por confirmar</option></select></td>
            <td className="p-2"><input type="checkbox" className="h-5 w-5" checked={p.active && p.price > 0} disabled={p.price === 0} onChange={(e) => patch(p.id, { active: e.target.checked })} /></td>
            <td className="p-2"><Button variant="ghost" size="icon" title="Editar producto" aria-label={`Editar ${p.name}`} onClick={() => setEditor(p)}><Pencil /></Button><Button aria-label="Eliminar" onClick={async () => { if (confirm(`¿Eliminar ${p.name}?`)) (await deleteProduct(p.id)) || saveErr(); }}><Trash2 className="h-4 w-4" /></Button></td>
          </tr>
        ))}</tbody>
      </table></div>
    </Card>
    </div>
  );
}

function Puestos() {
  const { vendors } = useCatalog();
  const [editor, setEditor] = useState<Vendor | null | undefined>(undefined);
  const patch = (id: string, p: Partial<Vendor>) => patchVendor(id, p, saveErr);
  const add = () => setEditor(null);
  return (
    <div className="space-y-3">
      {editor !== undefined && <VendorEditor vendor={editor} onClose={() => setEditor(undefined)} />}
      <Button className="inline-flex h-10 items-center rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground" onClick={add}><Plus className="mr-1 h-4 w-4" />Nuevo puesto</Button>
      <div className="grid gap-3 md:grid-cols-2">{vendors.map((v) => (
        <Card key={v.id} className={`grid grid-cols-2 gap-2 text-sm ${v.active ? "" : "opacity-60"}`}>
          {([["name", "Nombre"], ["stall", "Número"], ["pavilion", "Pabellón"], ["contact", "Responsable"], ["phone", "Teléfono"], ["schedule", "Horario"], ["specialty", "Especialidad"]] as const).map(([k, l]) => (
            <label key={k} className={k === "specialty" ? "col-span-2" : ""}><span className="text-xs text-muted-foreground">{l}</span><ValidatedInput className="h-9 w-full rounded-lg border bg-card px-2" inputMode={k === "phone" ? "numeric" : "text"} maxLength={k === "phone" ? 9 : undefined} transform={k === "phone" ? digits : undefined} value={v[k]} schema={k === "phone" ? optionalPhoneSchema : k === "contact" ? z.union([z.literal(""), personSchema]) : k === "name" ? businessSchema : z.string().max(200, "Máximo 200 caracteres")} onCommit={(value) => patch(v.id, { [k]: value })} /></label>
          ))}
          <div className="col-span-2 flex flex-wrap gap-2">
            <Button className="inline-flex h-9 items-center rounded-lg border px-3" onClick={() => patch(v.id, { active: !v.active })}>{v.active ? <><Pause className="mr-1 h-4 w-4" />Pausar</> : <><Play className="mr-1 h-4 w-4" />Activar</>}</Button>
            <Button className="inline-flex h-9 items-center rounded-lg border px-3" onClick={() => patch(v.id, { verified: !v.verified })}>{v.verified ? "Quitar verificado" : "Verificar"}</Button>
            <Button variant="outline" onClick={() => setEditor(v)}><Pencil />Editar</Button>
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

