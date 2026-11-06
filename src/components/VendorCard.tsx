import { Link } from "@tanstack/react-router";
import { BadgeCheck, Star } from "lucide-react";

export function VendorCard({ v }: { v: import("@/lib/data").Vendor }) {
  return (
    <div className="rounded-2xl border bg-card p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <span className="rounded-lg bg-accent px-2 py-1 text-xs font-bold text-accent-foreground">Pabellón {v.pavilion} · {v.stall}</span>
        <span className="flex items-center gap-1 text-sm font-semibold"><Star className="h-4 w-4 fill-primary text-primary" />{v.rating}</span>
      </div>
      <h3 className="mt-3 text-lg font-bold">{v.name}</h3>
      <p className="text-sm text-muted-foreground">{v.specialty}</p>
      <p className="mt-2 text-sm">Encargado: {v.contact}</p>
      {v.verified && <p className="mt-1 flex items-center gap-1 text-xs font-medium text-success"><BadgeCheck className="h-4 w-4" />Puesto verificado por Mercantista</p>}
      <Link to="/puestos/$id" params={{ id: v.id }} className="mt-4 inline-flex h-10 w-full items-center justify-center rounded-xl border font-semibold hover:bg-muted">Ver productos</Link>
    </div>
  );
}
