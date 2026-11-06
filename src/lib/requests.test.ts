import { describe, expect, it } from "vitest";
import { requestSchema } from "./requests";
const valid = { business: "Bodega prueba", contact: "Prueba", phone: "987654321", address: "Calle prueba 123", zone: "Lurín Cercado", delivery_date: "2026-11-02T08:00", items: [{ name: "Papa Canchán", qty: "2", unit: "Saco", quality: "Primera", vendor: "v1", notes: "" }] };
describe("requests validation", () => {
  it("accepts a written wholesale request", () => { expect(requestSchema.safeParse(valid).success).toBe(true); });
  it("rejects zero quantities", () => { expect(requestSchema.safeParse({ ...valid, items: [{ ...valid.items[0], qty: "0" }] }).success).toBe(false); });
  it("rejects invalid phone numbers", () => { expect(requestSchema.safeParse({ ...valid, phone: "123" }).success).toBe(false); });
});