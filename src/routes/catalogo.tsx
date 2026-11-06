import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { SearchX } from "lucide-react";
import { FORMATS, type Category } from "@/lib/data";
import { useCatalog } from "@/lib/catalog";
import { PriceNote, ProductCard } from "@/components/ProductCard";
import { Switch } from "@/components/ui/switch";

type S = { q?: string; cat?: Category; vendor?: string };
export const Route = createFileRoute("/catalogo")({
  validateSearch: (s: Record<string, unknown>): S => ({ q: s.q as string | undefined, cat: s.cat as Category | undefined, vendor: s.vendor as string | undefined }),
  head: () => ({ meta: [
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
    { title: "Catálogo mayorista de frutas y verduras — Mercantista" },
    { name: "description", content: "Papas, cebollas, tomates, cítricos y frutas por saco, jaba y malla desde los puestos de Unicachi." },
    { property: "og:title", content: "Catálogo mayorista — Mercantista" },
    { property: "og:description", content: "Frutas y verduras por mayor desde Unicachi con precios referenciales del día." },
  ] }),
  component: Catalogo,
});

const sel = "h-11 rounded-xl border bg-card px-3 text-sm";

function Catalogo() {
  const s = Route.useSearch();
  const { products, vendors: allVendors, categories, loaded } = useCatalog();
  const vendors = allVendors.filter((v) => v.active);
  const [q, setQ] = useState(s.q ?? "");
  const [cat, setCat] = useState<string>(s.cat ?? "");
  const [vendor, setVendor] = useState(s.vendor ?? "");
  const [format, setFormat] = useState("");
  const [max, setMax] = useState(200);
  const [onlyStock, setOnlyStock] = useState(false);
  const [sort, setSort] = useState("rel");

  const list = useMemo(() => {
    const r = products.filter((p) => p.active && (!q || p.name.toLowerCase().includes(q.toLowerCase())) && (!cat || p.category === cat) && (!vendor || p.vendorId === vendor) && (!format || p.format === format) && p.price <= max && (!onlyStock || p.availability === "disponible"));
    if (sort === "asc") r.sort((a, b) => a.price - b.price);
    if (sort === "desc") r.sort((a, b) => b.price - a.price);
    return r;
  }, [products, q, cat, vendor, format, max, onlyStock, sort]);

  return (
    <div className="space-y-5">
      <h1 className="text-3xl font-bold">Catálogo mayorista</h1>
      <PriceNote />
      <div className="grid gap-2 rounded-2xl border bg-card p-3 shadow-sm sm:grid-cols-2 lg:grid-cols-6">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar producto…" className={sel + " lg:col-span-2"} />
        <select value={cat} onChange={(e) => setCat(e.target.value)} className={sel}><option value="">Todo tipo</option>{categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
        <select value={vendor} onChange={(e) => setVendor(e.target.value)} className={sel}><option value="">Todos los puestos</option>{vendors.map((v) => <option key={v.id} value={v.id}>{v.stall} · {v.name}</option>)}</select>
        <select value={format} onChange={(e) => setFormat(e.target.value)} className={sel}><option value="">Todo formato</option>{FORMATS.map((f) => <option key={f}>{f}</option>)}</select>
        <select value={sort} onChange={(e) => setSort(e.target.value)} className={sel}><option value="rel">Relevancia</option><option value="asc">Precio: menor</option><option value="desc">Precio: mayor</option></select>
        <label className="flex items-center gap-3 text-sm lg:col-span-3">Precio hasta <b className="tabular-nums">S/ {max}</b><input type="range" min={20} max={200} step={5} value={max} onChange={(e) => setMax(+e.target.value)} className="flex-1 accent-[var(--primary)]" /></label>
        <label className="flex items-center gap-2 text-sm lg:col-span-3"><Switch checked={onlyStock} onCheckedChange={setOnlyStock} />Solo stock confirmado hoy</label>
      </div>
      <p className="text-sm text-muted-foreground">{list.length} productos</p>
      {!loaded ? <p className="p-10 text-center text-muted-foreground">Cargando catálogo...</p> : list.length === 0 ? (
        <div className="rounded-2xl border bg-card p-10 text-center"><SearchX className="mx-auto h-10 w-10 text-muted-foreground" /><p className="mt-2 font-semibold">No encontramos productos con esos filtros</p><p className="text-sm text-muted-foreground">Prueba otros filtros o envíanos una solicitud personalizada.</p></div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">{list.map((p) => <ProductCard key={p.id} p={p} />)}</div>
      )}
    </div>
  );
}
