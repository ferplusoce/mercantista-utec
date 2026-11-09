import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Package, ShoppingBag, Store, Trash2, Weight } from "lucide-react";
import { soles } from "@/lib/data";
import { cartSummary, clearCart, updateCart, useStore } from "@/lib/store";
import { useCatalog } from "@/lib/catalog";
import { Photo, QtyPicker, PriceNote } from "@/components/ProductCard";
import { quantitySchema } from "@/lib/validation";
import { finishTrialCart, isSurveyMode } from "@/lib/opinions";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/carrito")({
  head: () => ({ meta: [
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
    { title: "Tu pedido — Mercantista" },
    { name: "description", content: "Revisa tu pedido agrupado por puesto de Unicachi." },
    { property: "og:title", content: "Tu pedido — Mercantista" },
    { property: "og:description", content: "Carrito mayorista agrupado por puesto." },
  ] }),
  component: Carrito,
});

function Carrito() {
  const navigate = useNavigate();
  const [survey, setSurvey] = useState(false);
  useEffect(() => { setSurvey(isSurveyMode()); }, []);
  const cart = useStore((s) => s.cart);
  const { products, vendors } = useCatalog();
  const sum = cartSummary(cart, products);
  if (!sum.lines.length) return (
    <div className="mx-auto max-w-md rounded-2xl border bg-card p-10 text-center">
      <ShoppingBag className="mx-auto h-12 w-12 text-muted-foreground" />
      <h1 className="mt-3 text-2xl font-bold">Tu pedido está vacío</h1>
      <p className="text-muted-foreground">Agrega sacos, jabas o mallas desde el catálogo.</p>
      <Link to="/catalogo" className="mt-5 inline-flex h-12 items-center rounded-xl bg-primary px-6 font-semibold text-primary-foreground">Explorar catálogo</Link>
    </div>
  );
  const groups = vendors.map((v) => ({ v, lines: sum.lines.filter((l) => l.product.vendorId === v.id) })).filter((g) => g.lines.length);
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="min-w-0 space-y-4 lg:col-span-2">
        <h1 className="text-3xl font-bold">Tu pedido</h1>
        {groups.map(({ v, lines }) => (
          <div key={v.id} className="rounded-2xl border bg-card shadow-sm">
            <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-2 border-b p-4"><Store className="h-5 w-5 shrink-0 text-primary" /><div className="min-w-0"><p className="font-semibold">{v.name}</p><span className="text-sm text-muted-foreground">Puesto {v.stall}</span></div></div>
            {lines.map((l) => (
              <div key={l.productId} className="space-y-2 border-b p-4 last:border-0">
                <div className="flex items-start gap-3">
                  <Photo src={l.product.image} name={l.product.name} className="h-14 w-14 shrink-0 text-[10px]" />
                  <div className="min-w-0 flex-1"><p className="font-semibold">{l.product.name}</p><p className="text-sm text-muted-foreground">{l.product.unit} · {soles(l.product.price)} c/u</p></div>
                  <p className="shrink-0 font-bold tabular-nums">{soles(l.qty * l.product.price)}</p>
                </div>
                <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2">
                  <QtyPicker value={l.qty} onChange={(n) => updateCart(l.productId, { qty: n })} />
                  {!quantitySchema.safeParse(l.qty).success && <p className="text-xs text-destructive">Cantidad entera de 1 a 50</p>}
                  <input value={l.note} onChange={(e) => updateCart(l.productId, { note: e.target.value })} placeholder="Nota del producto…" className="h-11 min-w-0 w-full rounded-xl border px-3 text-sm" />
                  <button onClick={() => updateCart(l.productId, { qty: 0 })} className="grid h-11 w-11 place-items-center rounded-xl border" aria-label="Quitar"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
      <aside className="h-fit space-y-3 rounded-2xl border bg-card p-5 shadow-sm lg:sticky lg:top-36">
        <h2 className="text-lg font-bold">Resumen preliminar</h2>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="rounded-xl bg-muted p-3"><Weight className="h-4 w-4 text-primary" /><p className="mt-1 text-muted-foreground">Peso estimado</p><p className="font-bold">{sum.weightKg} kg</p></div>
          <div className="rounded-xl bg-muted p-3"><Package className="h-4 w-4 text-primary" /><p className="mt-1 text-muted-foreground">Bultos</p><p className="font-bold">{sum.packages}</p></div>
        </div>
        <p className="text-sm text-muted-foreground">{sum.vendors} {sum.vendors === 1 ? "puesto" : "puestos"} a visitar</p>
        <div className="flex justify-between border-t pt-3"><span>Subtotal productos Unicachi</span><b className="tabular-nums">{soles(sum.subtotal)}</b></div>
        <p className="text-xs text-muted-foreground">El costo del servicio de compra y entrega se define en el siguiente paso.</p>
        <PriceNote />
        {survey ? <Button className="h-auto min-h-16 w-full whitespace-normal rounded-xl px-4 py-4 text-base font-bold" onClick={() => {
          finishTrialCart(cart, products, vendors);
          clearCart();
          void navigate({ to: "/opinion" });
        }}>Terminé mi pedido de prueba → Dar mi opinión</Button> : <Button asChild className="h-12 w-full rounded-xl font-semibold"><Link to="/checkout">Elegir tipo de entrega</Link></Button>}
      </aside>
    </div>
  );
}
