import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { BadgeCheck, Clock, MapPin, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useCatalog } from "@/lib/catalog";
import { PriceNote, ProductCard } from "@/components/ProductCard";

export const Route = createFileRoute("/puestos/$id")({
  loader: async ({ params }) => { const { data: v, error } = await supabase.from("vendors").select("name, stall").eq("id", params.id).maybeSingle(); if (error) throw error; if (!v) throw notFound(); return { name: v.name, stall: v.stall }; },
  head: ({ loaderData }) => ({ meta: [
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
    { title: loaderData ? `${loaderData.name} - Puesto ${loaderData.stall} — Mercantista` : "Puesto no disponible" },
    { name: "description", content: "Productos mayoristas de este puesto de Unicachi." },
    { property: "og:title", content: loaderData ? `${loaderData.name} en Unicachi` : "Puesto" },
    { property: "og:description", content: "Compra por saco, jaba o malla a través de Mercantista." },
  ] }),
  component: Puesto,
});

function Puesto() {
  const { id } = Route.useParams();
  const c = useCatalog();
  const v = c.vendors.find((x) => x.id === id);
  const products = c.products.filter((p) => p.vendorId === id && p.active);
  if (!v) return <p className="p-10 text-center text-muted-foreground">{c.loaded ? "Puesto no encontrado." : "Cargando puesto..."}</p>;
  return (
    <div className="space-y-6">
      <div className="rounded-3xl border bg-card p-6 shadow-sm md:p-8">
        <span className="rounded-lg bg-accent px-2 py-1 text-xs font-bold text-accent-foreground">Pabellón {v.pavilion} · Puesto {v.stall}</span>
        <h1 className="mt-3 text-3xl font-bold">{v.name} - Puesto {v.stall}</h1>
        <p className="text-muted-foreground">{v.specialty}</p>
        <div className="mt-4 flex flex-wrap gap-4 text-sm">
          <span className="flex items-center gap-1"><User className="h-4 w-4 text-primary" />{v.contact}</span>
          <span className="flex items-center gap-1"><Clock className="h-4 w-4 text-primary" />{v.schedule}</span>
          <span className="flex items-center gap-1"><MapPin className="h-4 w-4 text-primary" />Mercado Mayorista Unicachi</span>
          {v.verified && <span className="flex items-center gap-1 font-medium text-success"><BadgeCheck className="h-4 w-4" />Puesto verificado por Mercantista</span>}
        </div>
        <Link to="/solicitud" search={{ vendor: v.id }} className="mt-5 inline-flex min-h-11 items-center rounded-xl border px-4 py-2 text-sm font-semibold hover:bg-muted">Pedir un producto especial a este puesto</Link>
      </div>
      <PriceNote />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">{products.map((p) => <ProductCard key={p.id} p={p} />)}</div>
    </div>
  );
}
