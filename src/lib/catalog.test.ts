import { describe, it, expect } from "vitest";
import { pickTopProducts } from "./catalog";
import type { Product } from "./data";

const mk = (id: string, availability: Product["availability"] = "disponible", active = true): Product => ({ id, name: id, category: "", vendorId: "v", unit: "Saco", format: "Saco", weightKg: 1, price: 1, quality: "Primera", availability, desc: "", image: null, imagePath: null, active });
const list = Array.from({ length: 12 }, (_, i) => mk(`p${i}`, i % 3 === 0 ? "agotado" : "disponible"));

describe("Lo más pedido", () => {
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
