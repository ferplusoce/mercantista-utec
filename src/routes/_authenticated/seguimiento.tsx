import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Check, MessageCircle, PackageSearch } from "lucide-react";
import { soles, waLink } from "@/lib/data";
import { useCatalog } from "@/lib/catalog";
import { STATUS_FLOW, STATUS_LABEL, type Order } from "@/lib/store";
import { Card } from "@/components/Field";
import { useMyOrders, useOrderByCode } from "@/lib/orders";
import { ClientPhotos } from "@/components/PhotoApproval";

export const Route = createFileRoute("/_authenticated/seguimiento")({
  validateSearch: (s: Record<string, unknown>) => ({ code: s.code as string | undefined }),
  head: () => ({ meta: [
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
    { title: "Seguimiento de pedido — Mercantista" },
    { name: "description", content: "Consulta el estado de tu pedido con tu código MCT." },
    { property: "og:title", content: "Seguimiento de pedido — Mercantista" },
    { property: "og:description", content: "Sigue tu compra desde Unicachi hasta tu bodega." },
  ] }),
  component: Seguimiento,
});

function detail(o: Order, s: string) {
  const d: Record<string, string> = {
    received: "Mercantista registró la orden.", verifying: "Coordinando con los vendedores de Unicachi.", purchasing: "Compra física y selección de calidad en proceso.",
    staging: o.service === "taxi_delivery" ? `Esperando o cargando el taxi placa ${o.taxi?.plate} en ${o.taxi?.meeting}.` : "Cargado en la van compartida, iniciando ruta a Lurín.",
    on_the_way: o.service === "taxi_delivery" ? "Tu taxi va en camino con la mercadería." : `En ruta a ${o.zone}. Llegada estimada: 40 min.`,
    delivered: "Mercadería recibida y verificada.",
  };
  return d[s];
}

function Seguimiento() {
  const { code } = Route.useSearch();
  const nav = useNavigate();
  const [q, setQ] = useState(code ?? "");
  const { data: orders = [] } = useMyOrders();
  const wa = useCatalog().tariffs.whatsapp;
  const { data: found, isLoading, isError } = useOrderByCode(code);
  const o = found ?? undefined;
  const idx = o ? STATUS_FLOW.indexOf(o.status) : -1;
  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <h1 className="text-3xl font-bold">Seguimiento de pedido</h1>
      <form onSubmit={(e) => { e.preventDefault(); nav({ to: "/seguimiento", search: { code: q.trim() } }); }} className="flex gap-2">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Ej. MCT-2026-0842" className="h-12 flex-1 rounded-xl border bg-card px-4 uppercase" />
        <button className="h-12 rounded-xl bg-primary px-5 font-semibold text-primary-foreground">Consultar</button>
      </form>
      <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">{orders.length > 0 && "Tus pedidos recientes: "}{orders.slice(0, 4).map((x) => <button key={x.code} onClick={() => { setQ(x.code); nav({ to: "/seguimiento", search: { code: x.code } }); }} className="rounded-full border px-2.5 py-0.5">{x.code}</button>)}</div>
      {code && isLoading && <p className="text-center text-muted-foreground">Buscando pedido...</p>}
      {code && isError && <p className="text-center text-destructive">No pudimos consultar el pedido. Inténtalo de nuevo.</p>}
      {code && !isLoading && !isError && !o && <Card className="text-center"><PackageSearch className="mx-auto h-10 w-10 text-muted-foreground" /><p className="mt-2 font-semibold">No encontramos el pedido {code}</p><p className="text-sm text-muted-foreground">Revisa el código o escríbenos por WhatsApp.</p></Card>}
      {o && (
        <Card className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div><p className="font-display text-2xl font-bold">{o.code}</p><p className="text-sm text-muted-foreground">{o.business} · {o.service === "taxi_delivery" ? "Entrega tipo 1 · Compra y subida a tu taxi" : "Entrega tipo 2 · Hasta tu bodega o almacén"} · {o.deliveryDate}</p></div>
            <p className="font-bold">{soles(o.total)}</p>
          </div>
          {o.status === "cancelled" ? <p className="rounded-xl bg-destructive/10 p-3 text-destructive">Pedido cancelado</p> : (
            <ol className="space-y-0">
              {STATUS_FLOW.map((s, i) => (
                <li key={s} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <span className={`grid h-8 w-8 place-items-center rounded-full border-2 ${i <= idx ? "border-success bg-success text-success-foreground" : "bg-card"}`}>{i <= idx ? <Check className="h-4 w-4" /> : i + 1}</span>
                    {i < STATUS_FLOW.length - 1 && <span className={`w-0.5 flex-1 ${i < idx ? "bg-success" : "bg-border"}`} />}
                  </div>
                  <div className="pb-5"><p className={`font-semibold ${i === idx ? "text-primary" : ""}`}>{STATUS_LABEL[s]}</p>{i <= idx && <p className="text-sm text-muted-foreground">{detail(o, s)}</p>}</div>
                </li>
              ))}
            </ol>
          )}
          <ClientPhotos o={o} />
          <div className="rounded-xl bg-muted p-4 text-sm">
            <p className="font-semibold">Equipo Mercantista</p><p className="text-muted-foreground">Estamos atentos a tu pedido en Unicachi.</p>
            <a href={waLink(`Hola Mercantista, quiero consultar sobre mi pedido ${o.code}`, wa)} target="_blank" rel="noreferrer" className="mt-3 inline-flex h-11 items-center rounded-xl bg-success px-4 font-semibold text-success-foreground"><MessageCircle className="mr-2 h-4 w-4" />Escríbenos por WhatsApp</a>
          </div>
        </Card>
      )}
    </div>
  );
}
