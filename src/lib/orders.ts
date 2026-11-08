import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Order, OrderStatus } from "./store";
import { priceSchema, quantitySchema, businessSchema, personSchema, phoneSchema, deliveryDateSchema, accountAddressSchema, taxiSchema, documentSchema } from "./validation";
import { useAuth } from "./auth";

type Row = {
  code: string; created_at: string; business: string; contact: string; phone: string; service: string; status: string;
  items: unknown; subtotal: number; service_fee: number; shipping_fee: number; total: number; weight_kg: number; packages: number;
  payment_plan: string | null; payment_method: string | null; payment_status: string; delivery_date: string | null;
  slot: string | null; zone: string | null; address: string | null; reference?: string | null; doc_type?: string | null; doc_number?: string | null; taxi: unknown; history: unknown;
};

export function fromRow(r: Row): Order {
  return {
    code: r.code, createdAt: r.created_at, business: r.business, contact: r.contact, phone: r.phone,
    service: r.service as Order["service"], status: r.status as OrderStatus, items: (r.items ?? []) as Order["items"],
    subtotal: Number(r.subtotal), serviceFee: Number(r.service_fee), shippingFee: Number(r.shipping_fee), total: Number(r.total),
    weightKg: Number(r.weight_kg), packages: r.packages, paymentPlan: r.payment_plan ?? "", paymentMethod: r.payment_method ?? "",
    paymentStatus: r.payment_status as Order["paymentStatus"], deliveryDate: r.delivery_date ?? "", slot: r.slot ?? "",
    zone: r.zone ?? undefined, address: r.address ?? undefined, taxi: (r.taxi ?? undefined) as Order["taxi"],
    reference: r.reference ?? undefined, docType: r.doc_type ?? undefined, docNumber: r.doc_number ?? undefined,
    history: (r.history ?? []) as Order["history"],
  };
}

/** Guarda un pedido del usuario autenticado y devuelve el código asignado. */
export async function createOrder(o: Omit<Order, "code" | "createdAt" | "status" | "history" | "paymentStatus">): Promise<string> {
  businessSchema.parse(o.business); personSchema.parse(o.contact); phoneSchema.parse(o.phone); deliveryDateSchema.parse(o.deliveryDate);
  documentSchema.parse({ docType: o.docType, docNumber: o.docNumber });
  o.items.forEach((i) => { quantitySchema.parse(i.qty); priceSchema.parse(i.unitPrice); });
  if (o.service === "minivan_delivery") accountAddressSchema.parse({ zone: o.zone, line: o.address, ref: o.reference });
  else taxiSchema.parse(o.taxi);
  const { data, error } = await supabase.rpc("create_order", { p: {
    business: o.business, contact: o.contact, phone: o.phone, service: o.service, items: o.items,
    subtotal: o.subtotal, service_fee: o.serviceFee, shipping_fee: o.shippingFee, total: o.total,
    weight_kg: o.weightKg, packages: o.packages, payment_plan: o.paymentPlan, payment_method: o.paymentMethod,
    reference: o.reference ?? null, doc_type: o.docType, doc_number: o.docNumber, delivery_date: o.deliveryDate, slot: o.slot, zone: o.zone ?? null, address: o.address ?? null, taxi: o.taxi ?? null,
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

export function useMyOrders() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["orders", "mine", user?.id], enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return (data as Row[]).map(fromRow);
    },
  });
}

/** Solo administradores (la base de datos bloquea al resto). */
export function useAllOrders(enabled = true) {
  return useQuery({
    queryKey: ["orders", "all"], enabled,
    queryFn: async () => {
      const { data, error } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return (data as Row[]).map(fromRow);
    },
  });
}

export function useOrderMutations() {
  const qc = useQueryClient();
  const refresh = () => Promise.all([qc.invalidateQueries({ queryKey: ["orders"] }), qc.invalidateQueries({ queryKey: ["admin", "dashboard"] })]);
  return {
    setStatus: async (o: Order, status: OrderStatus) => {
      const history = [...o.history, { status, at: new Date().toISOString() }];
      const { error } = await supabase.from("orders").update({ status, history }).eq("code", o.code);
      await refresh();
      if (error) throw error;
    },
    setItemPrice: async (o: Order, index: number, price: number) => {
      priceSchema.parse(price);
      const items = o.items.map((x, i) => (i === index ? { ...x, unitPrice: price } : x));
      const subtotal = items.reduce((a, x) => a + x.qty * x.unitPrice, 0);
      const { error } = await supabase.from("orders").update({ items, subtotal, total: subtotal + o.serviceFee + o.shippingFee }).eq("code", o.code);
      await refresh();
      if (error) throw error;
    },
  };
}

/** Sesión y rol de administrador, usando la única suscripción de sesión de la raíz. */
export function useAdmin() {
  const { user, loading } = useAuth();
  const role = useQuery({
    queryKey: ["admin-role", user?.id], enabled: !!user,
    queryFn: async () => {
      if (!user) return false;
      const { data, error } = await supabase.rpc("has_role", { _user_id: user.id, _role: "admin" });
      if (error) throw error;
      return !!data;
    },
  });
  return { loading: loading || (!!user && role.isLoading), email: user?.email, isAdmin: !!user && !!role.data };
}
