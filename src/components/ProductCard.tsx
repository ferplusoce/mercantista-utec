import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Minus, Plus, Store } from "lucide-react";
import { toast } from "sonner";
import { soles, type Product } from "@/lib/data";
import { addToCart } from "@/lib/store";
import { useCatalog } from "@/lib/catalog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";


export function AvailBadge({ a }: { a: Product["availability"] }) {
  const m = { disponible: ["Stock confirmado hoy", "bg-success/15 text-success"], agotado: ["Agotado en Unicachi", "bg-destructive/10 text-destructive"], por_confirmar: ["Precio por confirmar", "bg-secondary text-secondary-foreground"] }[a];
  return <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${m[1]}`}>{m[0]}</span>;
}

/** Foto liviana (lazy, tamaño fijo) o recuadro gris con el nombre cuando no hay foto. */
export function Photo({ src, name, className }: { src: string | null; name: string; className: string }) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  if (!src || failedSrc === src) return <div className={`grid place-items-center rounded-xl bg-muted p-2 text-center text-sm font-semibold text-muted-foreground ${className}`}>{name}</div>;
  return <img src={src} alt={name} onError={() => setFailedSrc(src)} loading="lazy" decoding="async" width={320} height={240} className={`rounded-xl bg-muted object-cover ${className}`} />;
}

export function ProductImage({ p, big }: { p: Product; big?: boolean }) {
  return <Photo src={p.image} name={p.name} className={big ? "h-48" : "h-32"} />;
}

export function QtyPicker({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  return (
    <div className="flex items-center rounded-xl border bg-card">
      <button className="p-2.5" onClick={() => onChange(Math.max(1, value - 1))} aria-label="Menos"><Minus className="h-4 w-4" /></button>
      <span className="w-8 text-center font-semibold tabular-nums">{value}</span>
      <button className="p-2.5" onClick={() => onChange(value + 1)} aria-label="Más"><Plus className="h-4 w-4" /></button>
    </div>
  );
}

export function ProductCard({ p }: { p: Product }) {
  const [qty, setQty] = useState(1);
  const [open, setOpen] = useState(false);
  const { products, vendors, categories } = useCatalog();
  const v = vendors.find((x) => x.id === p.vendorId) ?? { id: p.vendorId, name: "Puesto", stall: "-", pavilion: "-", schedule: "" };
  const add = (n: number) => { addToCart(p.id, n); toast.success(`${n} × ${p.unit} de ${p.name} agregado al pedido`); };
  return (
    <div className="flex flex-col rounded-2xl border bg-card p-3 shadow-sm">
      <button onClick={() => setOpen(true)} className="text-left">
        <ProductImage p={p} />
        <div className="mt-3 flex flex-wrap gap-1.5">
          <span className="rounded-full bg-muted px-2 py-0.5 text-[11px]">{categories.find((c) => c.id === p.category)?.name.split(",")[0] ?? "Otros"}</span>
          <span className="rounded-full bg-accent px-2 py-0.5 text-[11px] text-accent-foreground">Puesto {v.stall}</span>
        </div>
        <h3 className="mt-2 font-semibold leading-tight">{p.name}</h3>
        <p className="text-sm text-muted-foreground">{p.unit}</p>
      </button>
      <div className="mt-2 flex items-center justify-between">
        <p className="font-display text-xl font-bold">{soles(p.price)}</p>
        <AvailBadge a={p.availability} />
      </div>
      <div className="mt-3 flex gap-2">
        <QtyPicker value={qty} onChange={setQty} />
        <button disabled={p.availability === "agotado"} onClick={() => add(qty)} className="flex-1 rounded-xl bg-primary text-sm font-semibold text-primary-foreground disabled:opacity-40">Agregar al pedido</button>
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto rounded-2xl">
          <DialogHeader><DialogTitle>{p.name}</DialogTitle></DialogHeader>
          <ProductImage p={p} big />
          <p className="text-sm">{p.desc}</p>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="rounded-xl bg-muted p-3"><p className="text-muted-foreground">Presentación</p><p className="font-semibold">{p.unit}</p></div>
            <div className="rounded-xl bg-muted p-3"><p className="text-muted-foreground">Calidad</p><p className="font-semibold">{p.quality}</p></div>
          </div>
          <Link to="/puestos/$id" params={{ id: v.id }} className="flex items-center gap-3 rounded-xl border p-3 text-sm hover:bg-muted">
            <Store className="h-5 w-5 text-primary" />
            <div><p className="font-semibold">{v.name} · Pabellón {v.pavilion}, Puesto {v.stall}</p><p className="text-muted-foreground">Despacha {v.schedule}</p></div>
          </Link>
          <p className="rounded-xl bg-secondary p-3 text-xs">El precio mayorista varía cada madrugada según la oferta de Unicachi. Te confirmamos el monto exacto antes de comprar.</p>
          <div>
            <p className="mb-2 text-sm font-semibold">Más de este puesto</p>
            <div className="flex flex-wrap gap-2">{products.filter((x) => x.vendorId === p.vendorId && x.id !== p.id).map((x) => <span key={x.id} className="rounded-full border px-2.5 py-1 text-xs">{x.name}</span>)}</div>
          </div>
          <button disabled={p.availability === "agotado"} onClick={() => { add(qty); setOpen(false); }} className="h-12 rounded-xl bg-primary font-semibold text-primary-foreground disabled:opacity-40">Agregar {qty} al pedido · {soles(qty * p.price)}</button>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function PriceNote() {
  return <p className="rounded-xl border border-primary/30 bg-accent p-3 text-sm text-accent-foreground">Los precios del Mercado Mayorista Unicachi pueden variar diariamente según la oferta del día. Los montos mostrados son referencias actualizadas esta madrugada.</p>;
}
