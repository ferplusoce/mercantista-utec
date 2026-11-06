import { ShoppingBag, Truck, Camera, Wallet } from "lucide-react";

export const WELCOME_TEXT = "Mercantista compra por ti en el Mercado Unicachi. Tú eliges tus productos y tus caseros, nosotros compramos y te mandamos foto y precio de cada producto para que lo apruebes antes de pagar. Sin madrugar ni perder 4 horas.";
const steps = [
  { icon: ShoppingBag, title: "Arma tu pedido", text: "Elige productos y el puesto de tu casero." },
  { icon: Truck, title: "Elige tu entrega", text: "Tipo 1 en tu taxi (S/ 50) o tipo 2 hasta tu bodega." },
  { icon: Camera, title: "Aprueba por foto", text: "Te enviamos foto y precio real de cada producto; tú apruebas o pides cambio." },
  { icon: Wallet, title: "Recibe y paga", text: "Con Yape, Plin o efectivo." },
];
export function HowItWorks({ compact = false }: { compact?: boolean }) {
  return <ol className={`grid gap-5 ${compact ? "" : "md:grid-cols-2 lg:grid-cols-4"}`}>{steps.map(({ icon: Icon, title, text }, i) => <li key={title} className="flex items-start gap-3"><Icon aria-hidden className="mt-1 h-7 w-7 shrink-0 text-primary" /><div><h3 className="text-xl font-bold">{i + 1}) {title}</h3><p className="mt-1 text-lg text-muted-foreground">{text}</p></div></li>)}</ol>;
}