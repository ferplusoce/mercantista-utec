import { createFileRoute } from "@tanstack/react-router";
import { Car, Truck } from "lucide-react";
import { ZONES, soles } from "@/lib/data";
import { useCatalog } from "@/lib/catalog";
import { Simulator } from "@/components/Simulator";
import type { Tramo } from "@/lib/pricing";

export const Route = createFileRoute("/servicios")({
  head: () => ({ meta: [
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
    { title: "Servicios y tarifas — Mercantista" },
    { name: "description", content: "Compra y subida a tu taxi por S/ 50, o entrega en tu bodega en van compartida según zona y peso." },
    { property: "og:title", content: "Servicios y tarifas — Mercantista" },
    { property: "og:description", content: "Tarifas transparentes para Lurín y Lima Sur." },
  ] }),
  component: Servicios,
});

function Servicios() {
  const t = useCatalog().tariffs;
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Servicios y tarifas</h1>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border bg-card p-6 shadow-sm">
          <Car className="h-8 w-8 text-primary" />
          <h2 className="mt-3 text-xl font-bold">Entrega tipo 1 · Compra y subida a tu taxi</h2>
          <p className="mt-2 text-sm text-muted-foreground">Compramos a tus caseros en Unicachi, te enviamos la foto de cada producto y subimos todo a tu taxi.</p>
          <p className="mt-3 font-semibold">{soles(t.taxiFlat)} fijo por pedido</p>
          <p className="mt-3 rounded-xl bg-muted p-3 text-xs">La carrera del taxi la pagas directo a tu conductor.</p>
        </div>
        <div className="rounded-2xl border border-primary/40 bg-card p-6 shadow-sm">
          <Truck className="h-8 w-8 text-primary" />
          <h2 className="mt-3 text-xl font-bold">Entrega tipo 2 · Hasta tu bodega o almacén</h2>
          <p className="mt-2 text-sm text-muted-foreground">Lo llevamos en van compartida hasta tu local. Máximo 750 kg por pedido.</p>
          <p className="mt-3 font-semibold">Desde S/ 100 según tu zona y el peso. Sin cobros aparte.</p>
        </div>
      </div>
      <section><h2 className="mb-3 text-2xl font-bold">Simulador de tarifa</h2><Simulator /></section>
      <section>
        <h2 className="mb-3 text-2xl font-bold">Precios por zona</h2>
        <div className="overflow-x-auto rounded-2xl border bg-card">
          <table className="w-full text-sm">
            <thead className="bg-muted text-left"><tr><th className="p-3">Zonas</th><th className="p-3">Hasta 200 kg</th><th className="p-3">Hasta 450 kg</th><th className="p-3">Hasta 750 kg</th></tr></thead>
            <tbody>{([1, 2] as Tramo[]).map((n) => <tr key={n} className="border-t"><td className="p-3">{ZONES.filter((z) => t.zoneTramo[z] === n).join(", ")}</td>{t.tramos[n].map((p, i) => <td key={i} className="p-3 tabular-nums">{soles(p)}</td>)}</tr>)}</tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
