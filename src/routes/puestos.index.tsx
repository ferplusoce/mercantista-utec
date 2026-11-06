import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useCatalog } from "@/lib/catalog";
import { VendorCard } from "@/components/VendorCard";

export const Route = createFileRoute("/puestos/")({
  head: () => ({ meta: [
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
    { title: "Puestos de Unicachi — Mercantista" },
    { name: "description", content: "Directorio de puestos y vendedores mayoristas del Mercado Unicachi." },
    { property: "og:title", content: "Puestos de Unicachi — Mercantista" },
    { property: "og:description", content: "Elige de qué puesto quieres tus frutas y verduras." },
  ] }),
  component: Puestos,
});

function Puestos() {
  const vendors = useCatalog().vendors.filter((v) => v.active);
  const [q, setQ] = useState("");
  const [pab, setPab] = useState("");
  const list = vendors.filter((v) => (v.name + v.stall + v.specialty).toLowerCase().includes(q.toLowerCase()) && (!pab || v.pavilion === pab));
  return (
    <div className="space-y-5">
      <h1 className="text-3xl font-bold">Puestos de Unicachi</h1>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Busca por nombre, número o especialidad" className="h-11 flex-1 rounded-xl border bg-card px-3 text-sm" />
        <div className="flex gap-1">{["", "A", "B", "C", "D", "E"].map((p) => <button key={p} onClick={() => setPab(p)} className={`h-11 rounded-xl border px-4 text-sm ${pab === p ? "bg-primary text-primary-foreground" : "bg-card"}`}>{p || "Todos"}</button>)}</div>
      </div>
      {list.length === 0 ? <p className="rounded-2xl border bg-card p-8 text-center text-muted-foreground">Sin puestos con ese criterio.</p> :
        <div className="grid gap-4 md:grid-cols-3">{list.map((v) => <VendorCard key={v.id} v={v} />)}</div>}
    </div>
  );
}
