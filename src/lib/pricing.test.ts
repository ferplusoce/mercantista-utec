import { describe, it, expect } from "vitest";
import { taxiFee, vanFee } from "./pricing";

describe("tarifas oficiales", () => {
  it("taxi: S/ 50 fijo por pedido", () => expect(taxiFee()).toBe(50));
  it("tramo 1 hasta 200 kg: S/ 100", () => expect(vanFee({ zone: "Lurín Cercado", kg: 200 })).toEqual({ ok: true, tramo: 1, total: 100 }));
  it("tramo 1 hasta 450 kg: S/ 115", () => expect(vanFee({ zone: "Lurín - Julio C. Tello", kg: 450 }).total).toBe(115));
  it("tramo 1 hasta 750 kg: S/ 130", () => expect(vanFee({ zone: "Villa El Salvador (limítrofe)", kg: 750 }).total).toBe(130));
  it("tramo 2 hasta 200 kg: S/ 130.50", () => expect(vanFee({ zone: "Lurín - Huertos de Lurín", kg: 150 })).toEqual({ ok: true, tramo: 2, total: 130.5 }));
  it("tramo 2 hasta 450 kg: S/ 145", () => expect(vanFee({ zone: "Lurín - Km 40 / Arica", kg: 201 }).total).toBe(145));
  it("tramo 2 hasta 750 kg: S/ 160", () => expect(vanFee({ zone: "Pachacámac (zonas bajas)", kg: 451 }).total).toBe(160));
  it("más de 750 kg no se acepta", () => expect(vanFee({ zone: "Lurín Cercado", kg: 751 }).ok).toBe(false));
});
