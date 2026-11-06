import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Order, OrderStatus } from "./store";

type Row = {
  code: string; created_at: string; business: string; contact: string; phone: string; service: string; status: string;
  items: unknown; subtotal: number; service_fee: number; shipping_fee: number; total: number; weight_kg: number; packages: number;
  payment_plan: string | null; payment_method: string | null; payment_status: string; delivery_date: string | null;
  slot: string | null; zone: string | null; address: string | null; taxi: unknown; history: unknown;
};

export function fromRow(r: Row): Order {
  return {
    code: r.code, createdAt: r.created_at, business: r.business, contact: r.contact, phone: r.phone,
    service: r.service as Order["service"], status: r.status as OrderStatus, items: (r.items ?? []) as Order["items"],
    subtotal: Number(r.subtotal), serviceFee: Number(r.service_fee), shippingFee: Number(r.shipping_fee), total: Number(r.total),
    weightKg: Number(r.weight_kg), packages: r.packages, paymentPlan: r.payment_plan ?? "", paymentMethod: r.payment_method ?? "",
    paymentStatus: r.payment_status as Order["paymentStatus"], deliveryDate: r.delivery_date ?? "", slot: r.slot ?? "",
    zone: r.zone ?? undefined, address: r.address ?? undefined, taxi: (r.taxi ?? undefined) as Order["taxi"],
    history: (r.history ?? []) as Order["history"],
  };
}

/** Guarda un pedido nuevo en la base de datos y devuelve el código asignado. */
export async function createOrder(o: Omit<Order, "code" | "createdAt" | "status" | "history" | "paymentStatus">): Promise<string> {
  const { data, error } = await supabase.rpc("create_order", { p: {
    business: o.business, contact: o.contact, phone: o.phone, service: o.service, items: o.items,
    subtotal: o.subtotal, service_fee: o.serviceFee, shipping_fee: o.shippingFee, total: o.total,
    weight_kg: o.weightKg, packages: o.packages, payment_plan: o.paymentPlan, payment_method: o.paymentMethod,
    delivery_date: o.deliveryDate, slot: o.slot, zone: o.zone ?? null, address: o.address ?? null, taxi: o.taxi ?? null,
  } });
  if (error) throw error;
  return data as string;
}

export async function fetchOrderByCode(code: string): Promise<Order | null> {
  const { data, error } = await supabase.rpc("get_order_by_code", { _code: code });
  if (error) throw error;
  const row = (data as Row[] | null)?.[0];
  return row ? fromRow(row) : null;
}

export function useOrderByCode(code?: string) {
  return useQuery({ queryKey: ["order", code?.toUpperCase()], queryFn: () => fetchOrderByCode(code!), enabled: !!code, refetchInterval: 30_000 });
}

/** Solo administradores (la base de datos bloquea al resto). */
export function useAllOrders(enabled = true) {
  return useQuery({
    queryKey: ["orders"], enabled,
    queryFn: async () => {
      const { data, error } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return (data as Row[]).map(fromRow);
    },
  });
}

export function useOrderMutations() {
  const qc = useQueryClient();
  const refresh = () => qc.invalidateQueries({ queryKey: ["orders"] });
  return {
    setStatus: async (o: Order, status: OrderStatus) => {
      const history = [...o.history, { status, at: new Date().toISOString() }];
      const { error } = await supabase.from("orders").update({ status, history }).eq("code", o.code);
      await refresh();
      if (error) throw error;
    },
    setItemPrice: async (o: Order, index: number, price: number) => {
      const items = o.items.map((x, i) => (i === index ? { ...x, unitPrice: price } : x));
      const subtotal = items.reduce((a, x) => a + x.qty * x.unitPrice, 0);
      const { error } = await supabase.from("orders").update({ items, subtotal, total: subtotal + o.serviceFee + o.shippingFee }).eq("code", o.code);
      await refresh();
      if (error) throw error;
    },
  };
}

/** Sesión y rol de administrador. */
export function useAdmin() {
  const [state, setState] = useState<{ loading: boolean; email?: string; isAdmin: boolean }>({ loading: true, isAdmin: false });
  useEffect(() => {
    const check = async () => {
      const { data } = await supabase.auth.getUser();
      const u = data.user;
      if (!u) return setState({ loading: false, isAdmin: false });
      const { data: r } = await supabase.rpc("has_role", { _user_id: u.id, _role: "admin" });
      setState({ loading: false, email: u.email, isAdmin: !!r });
    };
    check();
    const { data: sub } = supabase.auth.onAuthStateChange((e) => { if (e === "SIGNED_IN" || e === "SIGNED_OUT") check(); });
    return () => sub.subscription.unsubscribe();
  }, []);
  return state;
}
