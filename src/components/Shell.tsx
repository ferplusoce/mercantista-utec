import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Home, LayoutGrid, LogOut, MapPin, PackageSearch, Search, ShoppingBag, Store, User, ClipboardList, Leaf } from "lucide-react";
import { useStore } from "@/lib/store";
import { useCatalog } from "@/lib/catalog";
import { isCustomerProduct } from "@/lib/catalog-photos";
import { useAdmin } from "@/lib/orders";
import { useAuth } from "@/lib/auth";
import { WelcomeDialog } from "@/components/Welcome";

export function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground"><Leaf className="h-5 w-5" /></span>
      <span className="font-display text-xl font-bold">Mercantista</span>
    </Link>
  );
}

function SearchBox() {
  const [q, setQ] = useState("");
  const nav = useNavigate();
  const cat = useCatalog();
  const term = q.trim().toLowerCase();
  const hits = term.length < 2 ? [] : [
    ...cat.products.filter((p) => isCustomerProduct(p) && p.name.toLowerCase().includes(term)).slice(0, 5).map((p) => ({ label: p.name, sub: "Producto", go: () => nav({ to: "/catalogo", search: { q: p.name } }) })),
    ...cat.vendors.filter((v) => (v.name + v.stall).toLowerCase().includes(term)).slice(0, 3).map((v) => ({ label: v.name, sub: `Puesto ${v.stall}`, go: () => nav({ to: "/puestos/$id", params: { id: v.id } }) })),
  ];
  return (
    <div className="relative w-full">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <input value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { nav({ to: "/catalogo", search: { q } }); setQ(""); } }}
        placeholder="Busca papa, cebolla, puesto…" className="h-11 w-full rounded-xl border bg-card pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring" />
      {hits.length > 0 && (
        <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-xl border bg-card shadow-md">
          {hits.map((h) => (
            <button key={h.label} onClick={() => { h.go(); setQ(""); }} className="flex w-full justify-between px-3 py-2 text-left text-sm hover:bg-muted">
              <span>{h.label}</span><span className="text-muted-foreground">{h.sub}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function Header() {
  const count = useStore((s) => s.cart.reduce((n, c) => n + c.qty, 0));
  const { user, signOut } = useAuth();
  const { isAdmin } = useAdmin();
  const links = [["/catalogo", "Catálogo"], ["/puestos", "Puestos"], ["/servicios", "Servicios y tarifas"], ["/mis-pedidos", "Mis pedidos"], ["/admin", "Panel"]] as const;
  return (
    <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur">
      <div className="bg-foreground px-4 py-1.5 text-center text-xs text-background">
        <MapPin className="mr-1 inline h-3 w-3" />Entregas en Lurín y alrededores (Lima Sur)
      </div>
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3">
        <Logo />
        <div className="hidden flex-1 md:block"><SearchBox /></div>
        <Link to="/solicitud" search={{ vendor: undefined }} className="hidden rounded-xl border bg-card px-3 py-2 text-sm font-medium hover:bg-muted lg:inline-flex"><ClipboardList className="mr-1.5 h-4 w-4" />Solicitud personalizada</Link>
        <Link to={user ? "/cuenta" : "/auth"} search={user ? undefined : { redirect: undefined }} className="ml-auto hidden rounded-xl p-2 hover:bg-muted md:block md:ml-0" aria-label={user ? "Mi cuenta" : "Iniciar sesión"}><User className="h-5 w-5" /></Link>
        {user && <button onClick={() => void signOut()} className="hidden rounded-xl p-2 hover:bg-muted md:block" aria-label="Cerrar sesión" title="Cerrar sesión"><LogOut className="h-5 w-5" /></button>}
        <Link to="/carrito" className="relative ml-auto rounded-xl bg-primary p-2.5 text-primary-foreground md:ml-0" aria-label="Carrito">
          <ShoppingBag className="h-5 w-5" />
          {count > 0 && <span className="absolute -right-1.5 -top-1.5 grid h-5 min-w-5 place-items-center rounded-full bg-foreground px-1 text-[11px] font-bold text-background">{count}</span>}
        </Link>
      </div>
      <div className="px-4 pb-3 md:hidden"><SearchBox /></div>
      <nav className="mx-auto flex max-w-7xl flex-wrap items-center gap-1 px-4 pb-2">
        {links.filter(([to]) => to !== "/admin" || isAdmin).map(([to, l]) => <Link key={to} to={to} className="hidden rounded-lg px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted md:block [&.active]:bg-accent [&.active]:text-accent-foreground">{l}</Link>)}
      </nav>
      <WelcomeDialog />
    </header>
  );
}

export function MobileNav() {
  const { isAdmin } = useAdmin();
  const items = [["/", Home, "Inicio"], ["/catalogo", LayoutGrid, "Catálogo"], ["/puestos", Store, "Puestos"], ["/mis-pedidos", PackageSearch, "Mis pedidos"], [isAdmin ? "/admin" : "/cuenta", User, isAdmin ? "Panel" : "Cuenta"]] as const;
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t bg-card pb-[env(safe-area-inset-bottom)] md:hidden">
      {items.map(([to, Icon, l]) => (
        <Link key={to} to={to} activeOptions={{ exact: to === "/" }} className="flex flex-col items-center gap-0.5 py-2.5 text-[11px] text-muted-foreground [&.active]:text-primary">
          <Icon className="h-5 w-5" />{l}
        </Link>
      ))}
    </nav>
  );
}

export function Footer() {
  return (
    <footer className="mt-16 border-t bg-card pb-24 md:pb-0">
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-10 md:grid-cols-3">
        <div><Logo /><p className="mt-2 text-sm text-muted-foreground">Tu bodega abastecida, sin salir de ella.</p></div>
        <p className="text-sm text-muted-foreground">Compramos en el Mercado Mayorista Unicachi y entregamos en Lurín, Pachacámac y Villa El Salvador.</p>
      </div>
    </footer>
  );
}
