import { describe, it, expect, vi, afterEach } from "vitest";
import { pickTopProducts, fetchTopProductIds, patchProduct, patchVendor } from "./catalog";
import { supabase } from "@/integrations/supabase/client";
import type { Product } from "./data";

vi.mock("@/integrations/supabase/client", () => ({ supabase: { rpc: vi.fn(), from: vi.fn() } }));

const mk = (id: string, availability: Product["availability"] = "disponible", active = true): Product => ({ id, name: id, category: "", vendorId: "v", unit: "Saco", format: "Saco", weightKg: 1, price: 1, quality: "Primera", availability, desc: "", image: null, imagePath: null, active });
const list = Array.from({ length: 12 }, (_, i) => mk(`p${i}`, i % 3 === 0 ? "agotado" : "disponible"));

describe("Lo más pedido", () => {
  afterEach(() => { vi.restoreAllMocks(); vi.useRealTimers(); });
  it("consulta unidades de los últimos 30 días con límite de 8", async () => {
    const rpc = vi.spyOn(supabase, "rpc").mockResolvedValue({ data: [{ product_id: "p5", units: 12 }], error: null } as never);
    expect(await fetchTopProductIds()).toEqual(["p5"]);
    expect(rpc).toHaveBeenCalledWith("top_products", { _days: 30, _limit: 8 });
  });
  it("muestra los más pedidos en su orden, máximo 8", () => {
    const ids = ["p5", "p2", "p9", "p1", "p4", "p7", "p8", "p10", "p11", "p3"];
    expect(pickTopProducts(list, ids).map((p) => p.id)).toEqual(ids.slice(0, 8));
  });
  it("sin pedidos, muestra los disponibles", () => {
    const r = pickTopProducts(list, []);
    expect(r).toHaveLength(8);
    expect(r.every((p) => p.availability === "disponible")).toBe(true);
  });
  it("no muestra productos ocultos", () => {
    expect(pickTopProducts([mk("a", "disponible", false), mk("b")], ["a", "b"]).map((p) => p.id)).toEqual(["b"]);
  });
});

describe("Ediciones compartidas del administrador", () => {
  afterEach(() => { vi.restoreAllMocks(); vi.useRealTimers(); });
  it("guarda precio y nombre aunque se editen seguidos", async () => {
    vi.useFakeTimers();
    const update = vi.fn(() => ({ eq: vi.fn().mockResolvedValue({ error: null }) }));
    vi.spyOn(supabase, "from").mockReturnValue({ update, select: () => ({ order: async () => ({ data: [], error: null }), eq: () => ({ maybeSingle: async () => ({ data: { tariffs: {}, whatsapp: "51987654321" }, error: null }) }) }) } as never);
    patchProduct("papa-canchan", { price: 85 }, vi.fn());
    patchProduct("papa-canchan", { name: "Papa Canchán seleccionada" }, vi.fn());
    await vi.advanceTimersByTimeAsync(600);
    expect(update).toHaveBeenCalledExactlyOnceWith({ price: 85, name: "Papa Canchán seleccionada" });
  });
  it("guarda nombre y horario del puesto aunque se editen seguidos", async () => {
    vi.useFakeTimers();
    const update = vi.fn(() => ({ eq: vi.fn().mockResolvedValue({ error: null }) }));
    vi.spyOn(supabase, "from").mockReturnValue({ update, select: () => ({ order: async () => ({ data: [], error: null }), eq: () => ({ maybeSingle: async () => ({ data: { tariffs: {}, whatsapp: "51987654321" }, error: null }) }) }) } as never);
    patchVendor("don-lucho", { name: "Distribuidora Don Lucho" }, vi.fn());
    patchVendor("don-lucho", { schedule: "03:00 am - 11:00 am" }, vi.fn());
    await vi.advanceTimersByTimeAsync(600);
    expect(update).toHaveBeenCalledExactlyOnceWith({ name: "Distribuidora Don Lucho", schedule: "03:00 am - 11:00 am" });
  });
});
