import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { PackageOpen, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { soles } from "@/lib/data";
import { useMyOrders } from "@/lib/orders";
import { addToCart, STATUS_LABEL } from "@/lib/store";
import { Card } from "@/components/Field";

export const Route = createFileRoute("/_authenticated/mis-pedidos")({
  head: () => ({ meta: [
    { title: "Mis pedidos — Mercantista" },
    { name: "description", content: "Revisa el estado de tus compras, aprueba fotos y repite pedidos." },
    { property: "og:title", content: "Mis pedidos — Mercantista" },
    { property: "og:description", content: "Tus compras de Unicachi en un solo lugar." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
    { name: "robots", content: "noindex" },
  ] }),
  component: MisPedidos,
});

const dateText = (value: string) => new Intl.DateTimeFormat("es-PE", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(`${value}T12:00:00`));

function MisPedidos() {
  const query = useMyOrders();
  const navigate = useNavigate();
  const repeat = (items: { productId: string; qty: number }[]) => {
    items.forEach((item) => addToCart(item.productId, item.qty));
    toast.success("Productos agregados al carrito");
    void navigate({ to: "/carrito" });
  };

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <div><h1 className="text-3xl font-bold">Mis pedidos</h1><p className="mt-1 text-muted-foreground">Sigue tus compras y aprueba las fotos de tus productos.</p></div>
      {query.isLoading && <Card>Cargando tus pedidos...</Card>}
      {query.isError && <Card className="text-destructive">No pudimos cargar tus pedidos. Inténtalo otra vez.</Card>}
      {!query.isLoading && !query.isError && !query.data?.length && (
        <Card className="py-12 text-center"><PackageOpen className="mx-auto h-12 w-12 text-muted-foreground" /><h2 className="mt-3 text-xl font-bold">Aún no tienes pedidos</h2><p className="mt-1 text-muted-foreground">Arma tu primera compra en el catálogo.</p><Link to="/catalogo" className="mt-5 inline-flex h-12 items-center rounded-xl bg-primary px-6 font-semibold text-primary-foreground">Explorar catálogo</Link></Card>
      )}
      <div className="space-y-3">
        {query.data?.map((order) => (
          <Card key={order.code} className="space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div><p className="font-display text-xl font-bold">{order.code}</p><p className="text-sm text-muted-foreground">Entrega: {order.deliveryDate ? dateText(order.deliveryDate) : dateText(order.createdAt.slice(0, 10))} · {order.items.length} productos</p></div>
              <p className="text-xl font-bold tabular-nums">{soles(order.total)}</p>
            </div>
            <p className="inline-flex rounded-full bg-secondary px-3 py-1 text-sm font-semibold text-secondary-foreground">{STATUS_LABEL[order.status]}</p>
            <div className="grid gap-2 sm:grid-cols-2">
              <Link to="/seguimiento" search={{ code: order.code }} className="inline-flex h-11 items-center justify-center rounded-xl bg-primary px-4 font-semibold text-primary-foreground">Ver detalle</Link>
              <button onClick={() => repeat(order.items)} className="inline-flex h-11 items-center justify-center rounded-xl border px-4 font-semibold"><RotateCcw className="mr-2 h-4 w-4" />Repetir pedido</button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
