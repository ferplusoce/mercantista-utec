import { ZONES } from "./data";
import { opinionSchema } from "./validation";
import { supabase } from "@/integrations/supabase/client";
import type { Product, Vendor } from "./data";
import { cartSummary, type CartItem } from "./store";

export const OP_ZONES = [...ZONES];
export const OP_SERVICES = { tipo1: "Tipo 1 · En mi taxi (S/ 50)", tipo2: "Tipo 2 · Hasta mi bodega o almacén (desde S/ 100)" } as const;
export function deliveryType(value: string | null): keyof typeof OP_SERVICES | null {
  if (value === "tipo1" || value === "taxi") return "tipo1";
  if (value === "tipo2" || value === "tramo1" || value === "tramo2") return "tipo2";
  return null;
}
export function deliveryBreakdown(list: Opinion[]): [string, number][] {
  return Object.entries(OP_SERVICES).map(([key, label]) => [label, list.filter((o) => deliveryType(o.servicio_preferido) === key).length]);
}
export const OP_USARIA = { si: "Sí", tal_vez: "Tal vez", no: "No" } as const;
export const GOAL = 120;

export type Opinion = {
  id: string; created_at: string; zona: string | null; armo_sin_ayuda: boolean | null; tiempo_segundos: number | null;
  satisfaccion: number | null; lo_usaria: string | null; servicio_preferido: string | null; precio_justo: string | null;
  comentario: string | null; whatsapp: string | null; codigo_encuestador: string | null; order_code: string | null;
  carrito_resumen?: string | null;
};

const K_T0 = "mct_t0", K_E = "mct_encuestador", K_SEC = "mct_tsec", K_CODE = "mct_last_code";
const K_SURVEY = "mct_survey", K_CART = "mct_trial_cart";

export function isSurveyMode() {
  if (typeof window === "undefined") return false;
  return Boolean(new URLSearchParams(window.location.search).get("e")?.trim() || sessionStorage.getItem(K_SURVEY));
}

export function trialCartSummary(cart: CartItem[], products: Product[], vendors: Vendor[]) {
  const sum = cartSummary(cart, products);
  return [...sum.lines.map(({ product, qty }) => {
    const vendor = vendors.find((v) => v.id === product.vendorId);
    return `${product.name} [${product.id}] · ${qty} × ${product.unit} · ${vendor?.name ?? product.vendorId}${vendor?.stall ? ` (puesto ${vendor.stall})` : ""} · S/ ${(qty * product.price).toFixed(2)}`;
  }), `Total productos: S/ ${sum.subtotal.toFixed(2)}`].join("\n");
}

export function finishTrialCart(cart: CartItem[], products: Product[], vendors: Vendor[]) {
  if (!isSurveyMode()) return;
  const t0 = Number(sessionStorage.getItem(K_T0) || Date.now());
  sessionStorage.setItem(K_SEC, String(Math.max(0, Math.round((Date.now() - t0) / 1000))));
  sessionStorage.setItem(K_CART, trialCartSummary(cart, products, vendors));
  sessionStorage.removeItem(K_CODE);
}

export function opinionTracking() {
  return {
    tiempo_segundos: sessionStorage.getItem(K_SEC) ? Number(sessionStorage.getItem(K_SEC)) : null,
    codigo_encuestador: sessionStorage.getItem(K_SURVEY) || localStorage.getItem(K_E),
    order_code: sessionStorage.getItem(K_CART) ? null : sessionStorage.getItem(K_CODE),
    carrito_resumen: sessionStorage.getItem(K_CART),
  };
}

/** Llamar al abrir la app: guarda la hora de inicio y el encuestador (?e=fernando|moises). */
export function trackAppOpen() {
  if (typeof window === "undefined") return;
  if (!sessionStorage.getItem(K_T0)) sessionStorage.setItem(K_T0, String(Date.now()));
  const e = new URLSearchParams(window.location.search).get("e")?.trim().toLowerCase();
  if (e) {
    const encuestador = (e === "moisés" ? "moises" : e).slice(0, 50);
    if (sessionStorage.getItem(K_SURVEY) !== encuestador) {
      [K_SEC, K_CODE, K_CART].forEach((k) => sessionStorage.removeItem(k));
      sessionStorage.setItem(K_T0, String(Date.now()));
    }
    sessionStorage.setItem(K_SURVEY, encuestador);
  }
  if (e === "fernando" || e === "moises" || e === "moisés") localStorage.setItem(K_E, e === "fernando" ? "fernando" : "moises");
}

/** Llamar al enviar el pedido: fija los segundos desde que abrió la app. */
export function markOrderSent(code: string) {
  sessionStorage.removeItem(K_CART);
  const t0 = Number(sessionStorage.getItem(K_T0) || Date.now());
  sessionStorage.setItem(K_SEC, String(Math.round((Date.now() - t0) / 1000)));
  sessionStorage.setItem(K_CODE, code);
}

export async function submitOpinion(o: { zona: string; armo_sin_ayuda: boolean; satisfaccion: number; lo_usaria: string; servicio_preferido: string; precio_justo: string; comentario: string; whatsapp: string }) {
  opinionSchema.parse({ zona: o.zona, sinAyuda: o.armo_sin_ayuda ? "si" : "no", sat: o.satisfaccion, usaria: o.lo_usaria, serv: o.servicio_preferido, precio: o.precio_justo, comentario: o.comentario, whatsapp: o.whatsapp });
  const { error } = await supabase.from("opinions").insert({
    ...o, comentario: o.comentario || null, whatsapp: o.whatsapp || null, precio_justo: o.precio_justo || null,
    ...opinionTracking(),
  });
  if (error) throw error;
  // nueva sesión de medición para la siguiente persona
  [K_T0, K_SEC, K_CODE, K_CART, K_SURVEY].forEach((k) => sessionStorage.removeItem(k));
  sessionStorage.setItem(K_T0, String(Date.now()));
}

export function computeStats(list: Opinion[]) {
  const n = list.length;
  const pct = (c: number, d = n) => (d ? Math.round((c / d) * 100) : 0);
  const timed = list.filter((o) => o.tiempo_segundos != null);
  const sat = list.filter((o) => o.satisfaccion != null);
  return {
    n,
    sinAyuda: pct(list.filter((o) => o.armo_sin_ayuda).length),
    menos5: pct(timed.filter((o) => o.tiempo_segundos != null && o.tiempo_segundos < 300).length, timed.length),
    satisfaccion: sat.length ? Math.round((sat.reduce((s, o) => s + (o.satisfaccion ?? 0), 0) / sat.length) * 10) / 10 : 0,
    usariaWa: pct(list.filter((o) => o.lo_usaria === "si" && o.whatsapp?.trim()).length),
  };
}

export function toCSV(list: Opinion[]) {
  const cols: (keyof Opinion)[] = ["created_at", "zona", "armo_sin_ayuda", "tiempo_segundos", "satisfaccion", "lo_usaria", "servicio_preferido", "precio_justo", "comentario", "whatsapp", "codigo_encuestador", "order_code", "carrito_resumen"];
  const esc = (v: unknown) => { const s = v == null ? "" : String(v); return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
  return [cols.join(",") + ",tipo_entrega", ...list.map((o) => [...cols.map((c) => esc(o[c])), esc(deliveryType(o.servicio_preferido))].join(",")), "", "Por tipo de entrega,Opiniones", ...deliveryBreakdown(list).map(([label, count]) => `${esc(label)},${count}`)].join("\n");
}
