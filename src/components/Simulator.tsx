import { useState } from "react";
import { ZONES, soles } from "@/lib/data";
import { vanFee, taxiFee } from "@/lib/pricing";
import { useCatalog } from "@/lib/catalog";

export function Simulator() {
  const t = useCatalog().tariffs;
  const [zone, setZone] = useState<string>(ZONES[0]);
  const [kg, setKg] = useState(250);
  const m = vanFee({ zone, kg }, t);
  const c = "h-11 w-full rounded-xl border bg-card px-3 text-sm";
  return (
    <div className="grid gap-5 rounded-2xl border bg-card p-5 shadow-sm md:grid-cols-2">
      <div className="space-y-3">
        <label className="block text-sm font-medium">Zona de entrega<select className={c} value={zone} onChange={(e) => setZone(e.target.value)}>{ZONES.map((z) => <option key={z}>{z}</option>)}</select></label>
        <label className="block text-sm font-medium">Peso del pedido: <b>{kg} kg</b><input type="range" min={20} max={800} step={10} value={kg} onChange={(e) => setKg(+e.target.value)} className="w-full accent-[var(--primary)]" /></label>
      </div>
      <div className="grid gap-3">
        <div className="rounded-xl bg-muted p-4">
          <p className="text-sm font-semibold">Entrega tipo 1 · Compra y subida a tu taxi</p>
          <p className="font-display text-3xl font-bold">{soles(taxiFee(t))}</p>
          <p className="text-xs text-muted-foreground">Precio fijo por pedido. Incluye compra, foto de cada producto y subida a tu taxi. La carrera la pagas a tu chofer.</p>
        </div>
        <div className="rounded-xl bg-accent p-4">
          <p className="text-sm font-semibold">Entrega tipo 2 · Hasta tu bodega o almacén</p>
          {m.ok ? <>
            <p className="font-display text-3xl font-bold text-accent-foreground">{soles(m.total)}</p>
            <p className="text-xs">{zone} · compra, consolidación y flete incluidos.</p>
          </> : <p className="mt-1 text-sm text-destructive">Supera el límite de 750 kg por pedido. Divide el pedido o elige taxi.</p>}
        </div>
      </div>
    </div>
  );
}
