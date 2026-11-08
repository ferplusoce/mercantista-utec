import { useSyncExternalStore } from "react";
import type { Product } from "./data";
import { quantitySchema } from "./validation";
import { toast } from "sonner";

export type CartItem = { productId: string; qty: number; note: string };
export type OrderStatus = "received" | "verifying" | "purchasing" | "staging" | "on_the_way" | "delivered" | "cancelled";
export type Order = {
  code: string; createdAt: string; business: string; contact: string; phone: string;
  service: "taxi_delivery" | "minivan_delivery"; status: OrderStatus;
  items: { productId: string; name: string; vendorId: string; qty: number; unitPrice: number; unit: string; weightKg: number; note: string }[];
  subtotal: number; serviceFee: number; shippingFee: number; total: number; weightKg: number; packages: number;
  paymentPlan: string; paymentMethod: string; paymentStatus: "pending" | "partially_paid" | "paid";
  deliveryDate: string; slot: string; address?: string; reference?: string; docType?: string; docNumber?: string; zone?: string;
  taxi?: { driver: string; plate: string; phone: string; arrival: string; meeting: string };
  history: { status: OrderStatus; at: string }[];
};
export type CustomRequest = { code: string; createdAt: string; business: string; contact: string; phone: string; address: string; date: string; items: { name: string; qty: string; unit: string; quality: string; vendor: string; notes: string }[]; attachment?: string; status: "pending" | "quoted" | "approved" | "rejected" };
export type Cost = { date: string; fuel: number; driver: number; maintenance: number; other: number };

type State = { cart: CartItem[]; costs: Cost[] };

const initial = (): State => ({
  cart: [],
  costs: Array.from({ length: 7 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() - 6 + i); return { date: d.toISOString().slice(5, 10), fuel: 60 + (i % 3) * 8, driver: 70, maintenance: 15, other: 10 }; }),
});

const KEY = "mercantista-v2";
let state: State = initial();
let loaded = false;
const listeners = new Set<() => void>();
function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const { products: _p, vendors: _v, tariffs: _t, orders: _o, requests: _r, profile: _profile, ...rest } = JSON.parse(raw);
      state = { ...state, ...rest };
    }
  } catch { /* ignore */ }
}
export function setState(fn: (s: State) => Partial<State>) {
  load();
  state = { ...state, ...fn(state) };
  localStorage.setItem(KEY, JSON.stringify(state));
  listeners.forEach((l) => l());
}
const serverSnap = initial();
export function useStore<T>(sel: (s: State) => T): T {
  return useSyncExternalStore(
    (l) => { load(); listeners.add(l); l(); return () => listeners.delete(l); },
    () => sel(state),
    () => sel(serverSnap),
  );
}

export const addToCart = (productId: string, qty = 1) => setState((s) => {
  const ex = s.cart.find((c) => c.productId === productId);
  if (!quantitySchema.safeParse((ex?.qty ?? 0) + qty).success) { toast.error("Cantidad entera de 1 a 50 por producto"); return {}; }
  return { cart: ex ? s.cart.map((c) => (c.productId === productId ? { ...c, qty: c.qty + qty } : c)) : [...s.cart, { productId, qty, note: "" }] };
});
export const updateCart = (productId: string, patch: Partial<CartItem>) => setState((s) => {
  if (patch.qty !== undefined && patch.qty !== 0 && !quantitySchema.safeParse(patch.qty).success) { toast.error("Cantidad entera de 1 a 50 por producto"); return {}; }
  return { cart: s.cart.map((c) => (c.productId === productId ? { ...c, ...patch } : c)).filter((c) => c.qty > 0) };
});
export const clearCart = () => setState(() => ({ cart: [] }));

export const STATUS_LABEL: Record<OrderStatus, string> = { received: "Pedido recibido", verifying: "Verificando precios y puestos", purchasing: "Comprando en Unicachi", staging: "En estiba / punto de encuentro", on_the_way: "En camino a tu bodega", delivered: "Entregado y completado", cancelled: "Cancelado" };
export const STATUS_FLOW: OrderStatus[] = ["received", "verifying", "purchasing", "staging", "on_the_way", "delivered"];

/** Resume el carrito con productos actuales. */
export function cartSummary(cart: CartItem[], products: Product[]) {
  const lines = cart.flatMap((c) => { const product = products.find((p) => p.id === c.productId); return product && product.active ? [{ ...c, product }] : []; });
  const subtotal = lines.reduce((s, l) => s + l.qty * l.product.price, 0);
  const weightKg = lines.reduce((s, l) => s + l.qty * l.product.weightKg, 0);
  const packages = lines.reduce((s, l) => s + l.qty, 0);
  const vendors = new Set(lines.map((l) => l.product.vendorId)).size;
  return { lines, subtotal, weightKg, packages, vendors };
}
