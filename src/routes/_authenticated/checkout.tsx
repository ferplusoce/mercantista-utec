import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Car, CheckCircle2, Download, MessageCircle, Truck } from "lucide-react";
import { toast } from "sonner";
import { SLOTS, ZONES, soles, waLink } from "@/lib/data";
import { vanFee, taxiFee } from "@/lib/pricing";
import { createOrder } from "@/lib/orders";
import { markOrderSent } from "@/lib/opinions";
import { OpinionForm } from "@/components/OpinionForm";
import { useCatalog } from "@/lib/catalog";
import { cartSummary, clearCart, setState, useStore, type Order } from "@/lib/store";
import { Card, Field, inputCls, requireFields } from "@/components/Field";

export const Route = createFileRoute("/_authenticated/checkout")({
  head: () => ({ meta: [
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
    { title: "Cotización y confirmación — Mercantista" },
    { name: "description", content: "Elige taxi o entrega en tu bodega, método de pago y confirma tu pedido." },
    { property: "og:title", content: "Confirma tu pedido — Mercantista" },
    { property: "og:description", content: "Cotización transparente de tu abastecimiento." },
  ] }),
  component: Checkout,
});

const PLANS = ["Pago contra entrega (clientes frecuentes)", "Adelanto 50% y saldo al recibir", "Pago completo anticipado"];
const METHODS = ["Yape / Plin", "Transferencia BCP / BBVA / Interbank", "Efectivo contra entrega"];

function Checkout() {
  const cart = useStore((s) => s.cart);
  const { products, vendors, tariffs: t } = useCatalog();
  const profile = useStore((s) => s.profile);
  const sum = cartSummary(cart, products);
  const [service, setService] = useState<Order["service"]>("minivan_delivery");
  const [f, setF] = useState<Record<string, string>>({ business: "", contact: "", phone: "", date: new Date(Date.now() + 864e5).toISOString().slice(0, 10), slot: SLOTS[0], zone: ZONES[0], address: "", driver: "", plate: "", dphone: "", arrival: "05:00", meeting: "Puerta 2", plan: PLANS[0], method: METHODS[0], doc: "", razon: "", billAddr: "" });
  const [err, setErr] = useState<Record<string, string>>({});
  const [done, setDone] = useState<Order | null>(null);
  const [saving, setSaving] = useState(false);
  const set = (k: string) => (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value });

  if (done) return <Success o={done} />;
  if (!sum.lines.length) return <div className="rounded-2xl border bg-card p-10 text-center"><p className="font-semibold">No hay productos en tu pedido.</p><Link to="/catalogo" className="mt-3 inline-block text-primary">Ir al catálogo →</Link></div>;

  const mv = vanFee({ zone: f.zone, kg: sum.weightKg }, t);
  const serviceFee = service === "taxi_delivery" ? taxiFee(t) : mv.total;
  const shippingFee = 0;
  const total = sum.subtotal + serviceFee + shippingFee;

  const confirm = async () => {
    const keys = ["business", "contact", "phone", "date", ...(service === "taxi_delivery" ? ["driver", "plate", "dphone", "arrival", "meeting"] : ["address"])];
    const e = requireFields(f, keys);
    if (f.dphone && !/^9\d{8}$/.test(f.dphone)) e.dphone = "Celular de 9 dígitos";
    if (service === "taxi_delivery" && (f.arrival < "04:00" || f.arrival > "09:00")) e.arrival = "Entre 04:00 y 09:00 am";
    if (service === "minivan_delivery" && !mv.ok) e.service = "El pedido supera 750 kg, supera el límite por pedido";
    setErr(e);
    if (Object.keys(e).length) { toast.error("Completa los campos obligatorios"); return; }
    const o: Order = {
      code: "", createdAt: new Date().toISOString(), business: f.business, contact: f.contact, phone: f.phone, service, status: "received",
      items: sum.lines.map((l) => ({ productId: l.productId, name: l.product.name, vendorId: l.product.vendorId, qty: l.qty, unitPrice: l.product.price, unit: l.product.unit, weightKg: l.product.weightKg, note: l.note })),
      subtotal: sum.subtotal, serviceFee, shippingFee, total, weightKg: sum.weightKg, packages: sum.packages,
      paymentPlan: f.plan, paymentMethod: f.method, paymentStatus: "pending", deliveryDate: f.date, slot: service === "taxi_delivery" ? `Taxi llega ${f.arrival}` : f.slot,
      address: service === "minivan_delivery" ? f.address : undefined, zone: service === "minivan_delivery" ? f.zone : undefined,
      taxi: service === "taxi_delivery" ? { driver: f.driver, plate: f.plate.toUpperCase(), phone: f.dphone, arrival: f.arrival, meeting: f.meeting } : undefined,
      history: [{ status: "received", at: new Date().toISOString() }],
    };
    setSaving(true);
    try { o.code = await createOrder(o); } catch { toast.error("No pudimos guardar tu pedido. Revisa tu conexión e inténtalo otra vez."); return; } finally { setSaving(false); }
    setState((s) => ({ orders: [o, ...s.orders] }));
    markOrderSent(o.code);
    clearCart();
    toast.success(`Pedido ${o.code} registrado`);
    setDone(o);
    window.scrollTo(0, 0);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-5 lg:col-span-2">
        <h1 className="text-3xl font-bold">Elige tu entrega y confirma</h1>
        <div className="grid gap-3 md:grid-cols-2">
          {([["taxi_delivery", Car, "Entrega tipo 1 · Compra y subida a tu taxi", `${soles(taxiFee(t))} fijo por pedido`], ["minivan_delivery", Truck, "Entrega tipo 2 · Hasta tu bodega o almacén", mv.ok ? `${f.zone} · ${soles(mv.total)}` : "No disponible (> 750 kg)"]] as const).map(([id, Icon, title, price]) => (
            <button key={id} onClick={() => setService(id)} className={`rounded-2xl border-2 bg-card p-5 text-left shadow-sm ${service === id ? "border-primary" : "border-transparent"}`}>
              <Icon className="h-7 w-7 text-primary" /><p className="mt-2 font-bold">{title}</p><p className="text-sm text-muted-foreground">{price}</p>
            </button>
          ))}
        </div>
        {err.service && <p className="text-sm text-destructive">{err.service}</p>}

        <Card className="grid gap-3 md:grid-cols-2">
          <h2 className="font-bold md:col-span-2">Datos del negocio</h2>
          <div className="md:col-span-2">{profile.business && <button className="text-sm text-primary" onClick={() => setF({ ...f, business: profile.business, contact: profile.owner, phone: profile.phone, address: profile.addresses[0]?.line ?? "", doc: profile.doc })}>Usar datos de mi cuenta ({profile.business})</button>}</div>
          <Field label="Bodega / negocio" required error={err.business}><input className={inputCls} value={f.business} onChange={set("business")} /></Field>
          <Field label="Responsable" required error={err.contact}><input className={inputCls} value={f.contact} onChange={set("contact")} /></Field>
          <Field label="Celular / WhatsApp" required error={err.phone}><input className={inputCls} inputMode="tel" value={f.phone} onChange={set("phone")} /></Field>
          <Field label="Fecha de entrega" required error={err.date}><input type="date" className={inputCls} value={f.date} onChange={set("date")} /></Field>
        </Card>

        {service === "taxi_delivery" ? (
          <Card className="grid gap-3 md:grid-cols-2">
            <h2 className="font-bold md:col-span-2">Datos de tu taxi de confianza</h2>
            {profile.taxis.length > 0 && <div className="flex flex-wrap gap-2 md:col-span-2">{profile.taxis.map((x) => <button key={x.plate} onClick={() => setF({ ...f, driver: x.driver, plate: x.plate, dphone: x.phone })} className="rounded-full border px-3 py-1.5 text-sm">🚕 {x.driver} · {x.plate}</button>)}</div>}
            <Field label="Nombre del chofer" required error={err.driver}><input className={inputCls} value={f.driver} onChange={set("driver")} /></Field>
            <Field label="Placa del vehículo" required error={err.plate}><input className={inputCls} value={f.plate} onChange={set("plate")} placeholder="ABC-123" /></Field>
            <Field label="Celular del conductor" required error={err.dphone}><input className={inputCls} value={f.dphone} onChange={set("dphone")} /></Field>
            <Field label="Hora de llegada a Unicachi (04:00–09:00)" required error={err.arrival}><input type="time" min="04:00" max="09:00" className={inputCls} value={f.arrival} onChange={set("arrival")} /></Field>
            <Field label="Punto de encuentro" required error={err.meeting}><select className={inputCls} value={f.meeting} onChange={set("meeting")}>{["Puerta 1", "Puerta 2", "Puerta 3", "Estacionamiento A", "Estacionamiento B"].map((x) => <option key={x}>{x}</option>)}</select></Field>
            <p className="rounded-xl bg-muted p-3 text-xs md:col-span-2">El costo de la carrera del taxi lo pagas directamente a tu conductor. Mercantista solo cobra por compra, control de calidad y carga en Unicachi.</p>
          </Card>
        ) : (
          <Card className="grid gap-3 md:grid-cols-2">
            <h2 className="font-bold md:col-span-2">Entrega tipo 2 · Hasta tu bodega o almacén</h2>
            <Field label="Zona" required><select className={inputCls} value={f.zone} onChange={set("zone")}>{ZONES.map((z) => <option key={z}>{z}</option>)}</select></Field>
            <Field label="Turno" required><select className={inputCls} value={f.slot} onChange={set("slot")}>{SLOTS.map((z) => <option key={z}>{z}</option>)}</select></Field>
            <div className="md:col-span-2"><Field label="Dirección y referencia" required error={err.address}><input className={inputCls} value={f.address} onChange={set("address")} placeholder="Av. ..., frente a ..." /></Field></div>
          </Card>
        )}

        <Card className="grid gap-3 md:grid-cols-2">
          <h2 className="font-bold md:col-span-2">Pago</h2>
          <p className="rounded-xl bg-secondary p-3 text-sm md:col-span-2">Por ser mercado mayorista, validamos el precio exacto en Unicachi durante la madrugada y te avisamos cualquier diferencia antes de cobrar. <b>El pago se coordina por Yape, Plin, transferencia o contra entrega; no se procesan pagos en línea.</b></p>
          <Field label="Modalidad"><select className={inputCls} value={f.plan} onChange={set("plan")}>{PLANS.map((x) => <option key={x}>{x}</option>)}</select></Field>
          <Field label="Método preferido"><select className={inputCls} value={f.method} onChange={set("method")}>{METHODS.map((x) => <option key={x}>{x}</option>)}</select></Field>
          <Field label="DNI o RUC"><input className={inputCls} value={f.doc} onChange={set("doc")} /></Field>
          <Field label="Razón social (si factura)"><input className={inputCls} value={f.razon} onChange={set("razon")} /></Field>
        </Card>
      </div>

      <aside className="h-fit space-y-3 rounded-2xl border bg-card p-5 shadow-sm lg:sticky lg:top-36">
        <h2 className="text-lg font-bold">Cotización</h2>
        <ul className="max-h-60 space-y-1 overflow-y-auto text-sm">{sum.lines.map((l) => <li key={l.productId} className="flex justify-between gap-2"><span>{l.qty} × {l.product.name} <span className="text-muted-foreground">({vendors.find((v) => v.id === l.product.vendorId)?.stall})</span></span><span className="tabular-nums">{soles(l.qty * l.product.price)}</span></li>)}</ul>
        <p className="text-xs text-muted-foreground">{sum.weightKg} kg · {sum.packages} bultos · {sum.vendors} puestos</p>
        <div className="space-y-1 border-t pt-3 text-sm">
          <div className="flex justify-between"><span>Productos en Unicachi</span><span className="tabular-nums">{soles(sum.subtotal)}</span></div>
          <div className="flex justify-between gap-3"><span>{service === "taxi_delivery" ? "Entrega tipo 1 · Compra y subida a tu taxi" : `Entrega tipo 2 · Hasta tu bodega o almacén (${f.zone})`}</span><span className="tabular-nums">{soles(serviceFee)}</span></div>
          
        </div>
        <div className="flex justify-between border-t pt-3 text-lg font-bold"><span>Total estimado</span><span className="tabular-nums">{soles(total)}</span></div>
        <button onClick={confirm} disabled={saving} className="h-12 w-full rounded-xl bg-primary font-semibold text-primary-foreground disabled:opacity-60">{saving ? "Enviando pedido..." : "Confirmar y enviar pedido"}</button>
      </aside>
    </div>
  );
}

function Success({ o }: { o: Order }) {
  const text = `Hola Mercantista, quiero consultar sobre mi pedido ${o.code} (${soles(o.total)})`;
  return (
    <Card className="mx-auto max-w-lg text-center print:shadow-none">
      <CheckCircle2 className="mx-auto h-14 w-14 text-success" />
      <h1 className="mt-3 text-2xl font-bold">¡Pedido confirmado!</h1>
      <p className="text-muted-foreground">Tu código de seguimiento</p>
      <p className="font-display text-4xl font-extrabold text-primary">{o.code}</p>
      <p className="mt-2 text-sm">Total estimado <b>{soles(o.total)}</b> · {o.service === "taxi_delivery" ? "Entrega tipo 1 · Compra y subida a tu taxi" : "Entrega tipo 2 · Hasta tu bodega o almacén"}</p>
      <div className="mt-5 grid gap-2">
        <Link to="/seguimiento" search={{ code: o.code }} className="flex h-12 items-center justify-center rounded-xl bg-primary font-semibold text-primary-foreground">Seguir mi pedido</Link>
        <a href={waLink(text)} target="_blank" rel="noreferrer" className="flex h-12 items-center justify-center rounded-xl bg-success font-semibold text-success-foreground"><MessageCircle className="mr-2 h-5 w-5" />Compartir por WhatsApp</a>
        <button onClick={() => window.print()} className="flex h-12 items-center justify-center rounded-xl border font-semibold"><Download className="mr-2 h-5 w-5" />Descargar resumen PDF</button>
      </div>
      <div className="mt-6 text-left"><OpinionForm /></div>
    </Card>
  );
}
