import { createFileRoute, Link } from "@tanstack/react-router";
import { Clock, MessageCircle, ShoppingBag, ClipboardList, TrendingUp } from "lucide-react";
import hero from "@/assets/hero.jpg";
import { useQuery } from "@tanstack/react-query";
import { fetchTopProductIds, pickTopProducts, useCatalog } from "@/lib/catalog";
import { addToCart } from "@/lib/store";
import { soles, type Product } from "@/lib/data";
import { toast } from "sonner";
import { Photo, ProductCard } from "@/components/ProductCard";
import { VendorCard } from "@/components/VendorCard";
import { InstallButton } from "@/components/InstallButton";
import { HowItWorks } from "@/components/HowItWorks";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
    { title: "Mercantista — Abastece tu bodega desde Unicachi" },
    { name: "description", content: "Frutas y verduras del Mercado Mayorista Unicachi entregadas en tu taxi de confianza o en van compartida hasta tu bodega en Lurín." },
    { property: "og:title", content: "Mercantista — Tu bodega abastecida, sin salir de ella" },
    { property: "og:description", content: "Compramos en Unicachi por ti y entregamos en Lurín y Lima Sur." },
  ] }),
  component: Index,
});

function SectionTitle({ title, sub, link }: { title: string; sub?: string; link?: { to: string; label: string } }) {
  return (
    <div className="mb-4 flex items-end justify-between gap-4">
      <div><h2 className="text-2xl font-bold md:text-3xl">{title}</h2>{sub && <p className="text-muted-foreground">{sub}</p>}</div>
      {link && <Link to={link.to} className="shrink-0 text-sm font-semibold text-primary">{link.label} →</Link>}
    </div>
  );
}

function TopCard({ p }: { p: Product }) {
  return (
    <div className="flex flex-col rounded-2xl border bg-card p-2 shadow-sm">
      <Photo src={p.image} name={p.name} className="h-28" />
      <p className="mt-2 text-sm font-semibold leading-tight">{p.name}</p>
      <p className="text-xs text-muted-foreground">{p.unit}</p>
      <p className="mt-1 font-display text-lg font-bold">{soles(p.price)}</p>
      <button disabled={p.availability === "agotado"} onClick={() => { addToCart(p.id, 1); toast.success(`${p.name} agregado`); }} className="mt-auto h-11 rounded-xl bg-primary text-base font-semibold text-primary-foreground disabled:opacity-40">Agregar</button>
    </div>
  );
}

function Index() {
  const { products: all, vendors: allV, categories } = useCatalog();
  const products = all.filter((p) => p.active);
  const vendors = allV.filter((v) => v.active);
  const top = useQuery({ queryKey: ["top-products"], queryFn: fetchTopProductIds, staleTime: 5 * 60_000 });
  const masPedido = pickTopProducts(products, top.data ?? []);
  return (
    <div className="space-y-14">
      <section className="relative overflow-hidden rounded-3xl">
        <img src={hero} alt="Puestos de frutas y verduras en un mercado mayorista al amanecer" width={1600} height={912} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/90 via-foreground/70 to-foreground/20" />
        <div className="relative max-w-2xl p-6 py-12 text-background md:p-12 md:py-20">
          <span className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">Tu bodega abastecida, sin salir de ella</span>
          <h1 className="mt-4 text-3xl font-extrabold leading-tight md:text-5xl">Abastece tu bodega desde el Mercado Mayorista Unicachi sin moverte de tu negocio</h1>
          <p className="mt-4 text-background/85 md:text-lg">Tú eliges productos y caseros. Apruebas cada foto y precio antes de pagar.</p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link to="/catalogo" className="inline-flex h-12 items-center justify-center rounded-xl bg-primary px-6 font-semibold text-primary-foreground"><ShoppingBag className="mr-2 h-5 w-5" />Explorar catálogo</Link>
            <Link to="/solicitud" search={{ vendor: undefined }} className="inline-flex h-12 items-center justify-center rounded-xl bg-background px-6 font-semibold text-foreground"><ClipboardList className="mr-2 h-5 w-5" />Pedir lista por encargo</Link>
            <Link to="/opinion" className="inline-flex h-12 items-center justify-center rounded-xl border-2 border-background px-6 font-semibold text-background">Danos tu opinión</Link>
            <InstallButton />
          </div>
        </div>
      </section>

      <section><SectionTitle title="¿Cómo funciona?" /><HowItWorks /><div className="mt-6 grid gap-4 md:grid-cols-2"><p className="text-lg"><b>Entrega tipo 1 · Compra y subida a tu taxi</b><br />S/ 50 fijo. Compramos a tus caseros y subimos todo a tu taxi en Unicachi.</p><p className="text-lg"><b>Entrega tipo 2 · Hasta tu bodega o almacén</b><br />Desde S/ 100 según tu zona y el peso. Lo llevamos en van compartida hasta tu local.</p></div></section>

      <div className="grid gap-3 md:grid-cols-3">
        {[[TrendingUp, "Precios directos de Unicachi"], [Clock, "Entregas programadas en la mañana"], [MessageCircle, "Atención personalizada por WhatsApp"]].map(([I, t]) => {
          const Icon = I as typeof Clock;
          return <div key={t as string} className="flex items-center gap-3 rounded-2xl border bg-card p-4 shadow-sm"><Icon className="h-6 w-6 text-primary" /><span className="font-medium">{t as string}</span></div>;
        })}
      </div>

      {masPedido.length > 0 && <section>
        <SectionTitle title="Lo más pedido" sub="Lo que más compran las bodegas este mes" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">{masPedido.map((p) => <TopCard key={p.id} p={p} />)}</div>
      </section>}

      <section>
        <SectionTitle title="Categorías" sub="Todo por mayor: sacos, jabas, mallas y atados" />
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
          {categories.map((c) => (
            <Link key={c.id} to="/catalogo" search={{ cat: c.id }} className="rounded-2xl border bg-card p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
              <Photo src={c.image} name={c.name} className="h-20 text-xs" />
              <p className="mt-2 font-semibold leading-tight">{c.name}</p>
              <p className="text-xs text-muted-foreground">{c.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <SectionTitle title="Destacados de hoy" sub="Precios referenciales de esta madrugada" link={{ to: "/catalogo", label: "Ver catálogo" }} />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {products.filter((p) => p.availability === "disponible").slice(0, 8).map((p) => <ProductCard key={p.id} p={p} />)}
        </div>
      </section>

      <section>
        <SectionTitle title="Puestos destacados de Unicachi" link={{ to: "/puestos", label: "Ver todos" }} />
        <div className="grid gap-4 md:grid-cols-3">{vendors.slice(0, 3).map((v) => <VendorCard key={v.id} v={v} />)}</div>
      </section>

      <section className="flex flex-col items-start justify-between gap-4 rounded-3xl bg-primary p-8 text-primary-foreground md:flex-row md:items-center">
        <div><h2 className="text-2xl font-bold">¿Tienes tu lista lista?</h2><p className="opacity-90">Sube tu lista de compras o escríbela aquí y nosotros cotizamos en Unicachi por ti.</p></div>
        <Link to="/solicitud" search={{ vendor: undefined }} className="inline-flex h-12 items-center rounded-xl bg-background px-6 font-semibold text-foreground">Cotizar mi lista</Link>
      </section>
    </div>
  );
}

