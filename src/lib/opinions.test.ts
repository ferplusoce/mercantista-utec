import { describe, expect, it } from "vitest";
import { computeStats, deliveryType, deliveryBreakdown, toCSV, type Opinion } from "./opinions";

const op = (p: Partial<Opinion>): Opinion => ({ id: "x", created_at: "", zona: "Lurín", armo_sin_ayuda: true, tiempo_segundos: 200, satisfaccion: 4, lo_usaria: "si", servicio_preferido: "taxi", precio_justo: null, comentario: null, whatsapp: null, codigo_encuestador: null, order_code: null, ...p });

describe("Experimento 2", () => {
  it("cuenta menos de 5 minutos como < 300 s", () => {
    expect(computeStats([op({ tiempo_segundos: 299 }), op({ tiempo_segundos: 300 })]).menos5).toBe(50);
  });
  it("'lo usaría' solo cuenta si dijo sí y dejó WhatsApp", () => {
    expect(computeStats([op({ whatsapp: "987654321" }), op({ lo_usaria: "tal_vez", whatsapp: "987654321" }), op({})]).usariaWa).toBe(33);
  });
  it("satisfacción promedio", () => {
    expect(computeStats([op({ satisfaccion: 5 }), op({ satisfaccion: 4 })]).satisfaccion).toBe(4.5);
  });
  it("taxi antiguo cuenta como tipo 1", () => { expect(deliveryType("taxi")).toBe("tipo1"); });
  it("ambos tramos antiguos cuentan como tipo 2", () => {
    expect(deliveryType("tramo1")).toBe("tipo2"); expect(deliveryType("tramo2")).toBe("tipo2");
  });
  it("agrupa valores nuevos y antiguos sin modificar opiniones", () => {
    const list = ["taxi", "tipo1", "tramo1", "tramo2", "tipo2"].map((servicio_preferido) => op({ servicio_preferido }));
    expect(deliveryBreakdown(list).map((r) => r[1])).toEqual([2, 3]);
    expect(list.map((o) => o.servicio_preferido)).toEqual(["taxi", "tipo1", "tramo1", "tramo2", "tipo2"]);
  });
  it("exporta el tipo normalizado manteniendo el valor original", () => {
    const csv = toCSV([op({ servicio_preferido: "tramo2" })]);
    expect(csv.split("\n")[1].split(",")[6]).toBe("tramo2");
    expect(csv.split("\n")[1].split(",").at(-1)).toBe("tipo2");
  });
});
