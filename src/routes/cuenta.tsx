import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { RotateCcw, Trash2 } from "lucide-react";
import { ZONES, soles } from "@/lib/data";
import { STATUS_LABEL, addToCart, setState, useStore } from "@/lib/store";
import { Card, Field, inputCls } from "@/components/Field";
import { Welcome } from "@/components/Welcome";

export const Route = createFileRoute("/cuenta")({
  head: () => ({ meta: [
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
    { title: "Mi cuenta — Mercantista" },
    { name: "description", content: "Datos de tu bodega, direcciones, taxis de confianza e historial de pedidos." },
    { property: "og:title", content: "Mi cuenta — Mercantista" },
    { property: "og:description", content: "Gestiona tu abastecimiento." },
  ] }),
  component: Cuenta,
});

function Cuenta() {
  const p = useStore((s) => s.profile);
  const orders = useStore((s) => s.orders).filter((o) => o.business === p.business);
  const nav = useNavigate();
  const [taxi, setTaxi] = useState({ driver: "", plate: "", phone: "" });
  const [addr, setAddr] = useState({ zone: ZONES[0] as string, line: "", ref: "" });
  const upd = (k: keyof typeof p) => (e: { target: { value: string } }) => setState((s) => ({ profile: { ...s.profile, [k]: e.target.value } }));
  const repeat = (items: { productId: string; qty: number }[]) => { items.forEach((i) => addToCart(i.productId, i.qty)); toast.success("Productos agregados al pedido"); nav({ to: "/carrito" }); };
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-3xl font-bold">Mi cuenta</h1>
        <Welcome />
      </div>
      <p className="text-sm text-muted-foreground">Tus datos se guardan en este celular.</p>
      <Card className="grid gap-3 md:grid-cols-4">
        <Field label="Bodega"><input className={inputCls} value={p.business} onChange={upd("business")} /></Field>
        <Field label="Dueño"><input className={inputCls} value={p.owner} onChange={upd("owner")} /></Field>
        <Field label="Teléfono"><input className={inputCls} value={p.phone} onChange={upd("phone")} /></Field>
        <Field label="RUC / DNI"><input className={inputCls} value={p.doc} onChange={upd("doc")} /></Field>
      </Card>
      <div className="grid gap-5 md:grid-cols-2">
        <Card className="space-y-3">
          <h2 className="font-bold">Direcciones de entrega</h2>
          {p.addresses.map((a, i) => <div key={i} className="flex justify-between rounded-xl bg-muted p-3 text-sm"><div><p className="font-semibold">{a.line}</p><p className="text-muted-foreground">{a.zone} · {a.ref}</p></div><button aria-label="Eliminar" onClick={() => setState((s) => ({ profile: { ...s.profile, addresses: s.profile.addresses.filter((_, j) => j !== i) } }))}><Trash2 className="h-4 w-4" /></button></div>)}
          <select className={inputCls} value={addr.zone} onChange={(e) => setAddr({ ...addr, zone: e.target.value })}>{ZONES.map((z) => <option key={z}>{z}</option>)}</select>
          <input className={inputCls} placeholder="Dirección" value={addr.line} onChange={(e) => setAddr({ ...addr, line: e.target.value })} />
          <input className={inputCls} placeholder="Referencia (portón, color, esquina)" value={addr.ref} onChange={(e) => setAddr({ ...addr, ref: e.target.value })} />
          <button className="h-11 w-full rounded-xl border font-semibold" onClick={() => { if (!addr.line) { toast.error("Ingresa la dirección"); return; } setState((s) => ({ profile: { ...s.profile, addresses: [...s.profile.addresses, addr] } })); setAddr({ ...addr, line: "", ref: "" }); }}>Guardar dirección</button>
        </Card>
        <Card className="space-y-3">
          <h2 className="font-bold">Mis taxis de confianza</h2>
          {p.taxis.map((t, i) => <div key={i} className="flex justify-between rounded-xl bg-muted p-3 text-sm"><span>🚕 {t.driver} · {t.plate} · {t.phone}</span><button aria-label="Eliminar" onClick={() => setState((s) => ({ profile: { ...s.profile, taxis: s.profile.taxis.filter((_, j) => j !== i) } }))}><Trash2 className="h-4 w-4" /></button></div>)}
          <input className={inputCls} placeholder="Nombre del chofer" value={taxi.driver} onChange={(e) => setTaxi({ ...taxi, driver: e.target.value })} />
          <div className="grid grid-cols-2 gap-2"><input className={inputCls} placeholder="Placa" value={taxi.plate} onChange={(e) => setTaxi({ ...taxi, plate: e.target.value.toUpperCase() })} /><input className={inputCls} placeholder="Celular" value={taxi.phone} onChange={(e) => setTaxi({ ...taxi, phone: e.target.value })} /></div>
          <button className="h-11 w-full rounded-xl border font-semibold" onClick={() => { if (!taxi.driver || !taxi.plate) { toast.error("Completa chofer y placa"); return; } setState((s) => ({ profile: { ...s.profile, taxis: [...s.profile.taxis, taxi] } })); setTaxi({ driver: "", plate: "", phone: "" }); }}>Guardar taxi</button>
        </Card>
      </div>
      <Card>
        <h2 className="mb-3 font-bold">Historial de pedidos</h2>
        {orders.length === 0 ? <p className="text-sm text-muted-foreground">Aún no tienes pedidos. <Link to="/catalogo" className="text-primary">Haz el primero</Link></p> :
          <div className="space-y-2">{orders.map((o) => (
            <div key={o.code} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border p-3">
              <div><Link to="/seguimiento" search={{ code: o.code }} className="font-semibold text-primary">{o.code}</Link><p className="text-sm text-muted-foreground">{o.deliveryDate} · {o.items.length} productos · {STATUS_LABEL[o.status]}</p></div>
              <div className="flex items-center gap-3"><b>{soles(o.total)}</b><button onClick={() => repeat(o.items)} className="inline-flex h-10 items-center rounded-xl border px-3 text-sm font-semibold"><RotateCcw className="mr-1 h-4 w-4" />Repetir este pedido</button></div>
            </div>
          ))}</div>}
      </Card>
    </div>
  );
}
