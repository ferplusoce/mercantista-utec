import { useSyncExternalStore } from "react";
import { supabase } from "@/integrations/supabase/client";
import { DEFAULT_TARIFFS, type Tariffs } from "./pricing";
import type { Availability, CategoryInfo, Product, Vendor } from "./data";

/** Catálogo compartido leído desde Lovable Cloud (categorías, puestos, productos y ajustes). */
export type Catalog = { loaded: boolean; error: boolean; categories: CategoryInfo[]; vendors: Vendor[]; products: Product[]; tariffs: Tariffs };

const empty: Catalog = { loaded: false, error: false, categories: [], vendors: [], products: [], tariffs: DEFAULT_TARIFFS };
let cat: Catalog = empty;
let started = false;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());
const set = (p: Partial<Catalog>) => { cat = { ...cat, ...p }; emit(); };

const BUCKET = "product-images";
const isUrl = (s: string) => /^https?:\/\//.test(s);

/** Convierte rutas de almacenamiento en URLs firmadas (el bucket es privado con lectura abierta). */
async function resolveImages(paths: string[]) {
  const map = new Map<string, string>();
  const todo = [...new Set(paths.filter((p) => p && !isUrl(p)))];
  if (todo.length) {
    const { data } = await supabase.storage.from(BUCKET).createSignedUrls(todo, 60 * 60 * 24 * 7);
    data?.forEach((d) => { if (d.path && d.signedUrl) map.set(d.path, d.signedUrl); });
  }
  return (p: string | null) => (!p ? null : isUrl(p) ? p : map.get(p) ?? null);
}

export async function refreshCatalog() {
  const [c, v, p, s] = await Promise.all([
    supabase.from("categories").select("*").order("sort_order"),
    supabase.from("vendors").select("*").order("stall"),
    supabase.from("products").select("*").order("name"),
    supabase.from("settings").select("*").eq("id", 1).maybeSingle(),
  ]);
  if (c.error || v.error || p.error || s.error || !s.data) { set({ loaded: true, error: true }); return; }
  const img = await resolveImages([...(c.data ?? []).map((x) => x.image_url ?? ""), ...(p.data ?? []).map((x) => x.image_url ?? "")]);
  const t = (s.data?.tariffs ?? {}) as Partial<Tariffs>;
  set({
    loaded: true, error: false,
    categories: (c.data ?? []).map((x) => ({ id: x.id, name: x.name, desc: x.description, imagePath: x.image_url, image: img(x.image_url), sortOrder: x.sort_order })),
    vendors: (v.data ?? []).map((x) => ({ id: x.id, name: x.name, stall: x.stall, pavilion: x.pavilion, contact: x.contact, phone: x.phone, specialty: x.specialty, schedule: x.schedule, verified: x.verified, active: x.active, rating: Number(x.rating) })),
    products: (p.data ?? []).map((x) => ({ id: x.id, name: x.name, category: x.category_id ?? "", vendorId: x.vendor_id, unit: x.unit, format: x.format as Product["format"], weightKg: Number(x.weight_kg), price: Number(x.price), quality: x.quality as Product["quality"], availability: x.availability as Availability, desc: x.description, imagePath: x.image_url, image: img(x.image_url), active: x.active })),
    tariffs: { ...DEFAULT_TARIFFS, ...t, whatsapp: s.data?.whatsapp || DEFAULT_TARIFFS.whatsapp },
  });
}

function start() { if (started || typeof window === "undefined") return; started = true; void refreshCatalog(); }

export function useCatalog(): Catalog {
  return useSyncExternalStore((l) => { start(); listeners.add(l); return () => listeners.delete(l); }, () => cat, () => empty);
}
export const getCatalog = () => cat;

// ---------- Escrituras del administrador (RLS: solo rol admin) ----------
const timers = new Map<string, ReturnType<typeof setTimeout>>();
const pendingProducts = new Map<string, Partial<Product>>();
const pendingVendors = new Map<string, Partial<Vendor>>();
function debounce(key: string, fn: () => Promise<{ error: unknown }>, onError: () => void) {
  clearTimeout(timers.get(key));
  timers.set(key, setTimeout(async () => { const { error } = await fn(); if (error) onError(); }, 600));
}

const productRow = (p: Partial<Product>) => {
  const r: Record<string, unknown> = {};
  if (p.name !== undefined) r.name = p.name;
  if (p.category !== undefined) r.category_id = p.category || null;
  if (p.vendorId !== undefined) r.vendor_id = p.vendorId;
  if (p.unit !== undefined) r.unit = p.unit;
  if (p.format !== undefined) r.format = p.format;
  if (p.weightKg !== undefined) r.weight_kg = p.weightKg;
  if (p.price !== undefined) r.price = p.price;
  if (p.quality !== undefined) r.quality = p.quality;
  if (p.availability !== undefined) r.availability = p.availability;
  if (p.desc !== undefined) r.description = p.desc;
  if (p.active !== undefined) r.active = p.active;
  if (p.imagePath !== undefined) r.image_url = p.imagePath;
  return r;
};

export function patchProduct(id: string, p: Partial<Product>, onError: () => void) {
  set({ products: cat.products.map((x) => (x.id === id ? { ...x, ...p } : x)) });
  pendingProducts.set(id, { ...pendingProducts.get(id), ...p });
  debounce(`p:${id}`, async () => {
    const patch = pendingProducts.get(id) ?? {};
    pendingProducts.delete(id);
    const result = await supabase.from("products").update(productRow(patch) as never).eq("id", id);
    await refreshCatalog();
    return result;
  }, onError);
}
export async function addProduct(vendorId: string) {
  const { error } = await supabase.from("products").insert({ name: "Nuevo producto", vendor_id: vendorId, category_id: "hortalizas", unit: "Saco de 50 kg", format: "Saco", weight_kg: 50, price: 50, availability: "por_confirmar", description: "Producto agregado por el operador." });
  if (!error) await refreshCatalog();
  return !error;
}
export async function deleteProduct(id: string) {
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (!error) set({ products: cat.products.filter((x) => x.id !== id) });
  return !error;
}
export async function bulkPrice(pct: number) {
  const updates = cat.products.map((x) => ({ id: x.id, price: Math.round(x.price * (1 + pct / 100) * 2) / 2 }));
  const res = await Promise.all(updates.map((u) => supabase.from("products").update({ price: u.price }).eq("id", u.id)));
  await refreshCatalog();
  return res.every((r) => !r.error);
}

const vendorRow = (v: Partial<Vendor>) => { const { id: _id, ...rest } = v; return rest; };
export function patchVendor(id: string, v: Partial<Vendor>, onError: () => void) {
  set({ vendors: cat.vendors.map((x) => (x.id === id ? { ...x, ...v } : x)) });
  pendingVendors.set(id, { ...pendingVendors.get(id), ...v });
  debounce(`v:${id}`, async () => {
    const patch = pendingVendors.get(id) ?? {};
    pendingVendors.delete(id);
    const result = await supabase.from("vendors").update(vendorRow(patch)).eq("id", id);
    await refreshCatalog();
    return result;
  }, onError);
}
export async function addVendor() {
  const { error } = await supabase.from("vendors").insert({ id: `v-${Date.now()}`, name: "Nuevo puesto", stall: "F-01", pavilion: "F", schedule: "03:00 am - 11:00 am" });
  if (!error) await refreshCatalog();
  return !error;
}
export async function deleteVendor(id: string) {
  const { error } = await supabase.from("vendors").delete().eq("id", id);
  if (!error) await refreshCatalog();
  return !error;
}

export function patchSettings(t: Partial<Tariffs>, onError: () => void) {
  const next = { ...cat.tariffs, ...t };
  set({ tariffs: next });
  const { whatsapp, ...tariffs } = next;
  debounce("settings", async () => supabase.from("settings").update({ tariffs: tariffs as never, whatsapp }).eq("id", 1), onError);
}

/** Reduce la foto en el celular (máx. 640 px, WebP) antes de subirla, para que cargue liviana. */
export async function shrinkImage(file: File, max = 640): Promise<Blob> {
  const bmp = await createImageBitmap(file);
  const scale = Math.min(1, max / Math.max(bmp.width, bmp.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bmp.width * scale); canvas.height = Math.round(bmp.height * scale);
  const context = canvas.getContext("2d");
  if (!context) { bmp.close(); throw new Error("No se pudo procesar la foto"); }
  context.drawImage(bmp, 0, 0, canvas.width, canvas.height);
  bmp.close();
  return new Promise((res, rej) => canvas.toBlob((b) => (b ? res(b) : rej(new Error("No se pudo procesar la foto"))), "image/webp", 0.72));
}

export async function uploadImage(kind: "products" | "categories", id: string, file: File) {
  const blob = await shrinkImage(file);
  const path = `${kind}/${id}-${Date.now()}.webp`;
  const up = await supabase.storage.from(BUCKET).upload(path, blob, { contentType: "image/webp", upsert: true });
  if (up.error) return false;
  const { error } = await supabase.from(kind).update({ image_url: path }).eq("id", id);
  if (!error) await refreshCatalog();
  return !error;
}

/** "Lo más pedido": ids de los productos con más unidades en los últimos 30 días. */
export async function fetchTopProductIds(): Promise<string[]> {
  const { data, error } = await supabase.rpc("top_products", { _days: 30, _limit: 8 });
  if (error) return [];
  return (data ?? []).map((r) => r.product_id).filter(Boolean);
}

/** Elige los productos a mostrar: los más pedidos o, si no hay pedidos, los disponibles. */
export function pickTopProducts(products: Product[], topIds: string[], n = 8): Product[] {
  const byId = new Map(products.map((p) => [p.id, p]));
  const top = topIds.map((id) => byId.get(id)).filter((p): p is Product => !!p && p.active);
  if (top.length) return top.slice(0, n);
  return products.filter((p) => p.active && p.availability === "disponible").slice(0, n);
}
