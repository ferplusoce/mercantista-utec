import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Product, Vendor } from "./data";

const { insert } = vi.hoisted(() => ({ insert: vi.fn() }));
vi.mock("@/integrations/supabase/client", () => ({ supabase: { from: vi.fn(() => ({ insert })) } }));
import { finishTrialCart, isSurveyMode, opinionTracking, submitOpinion, toCSV, trackAppOpen, trialCartSummary } from "./opinions";

const products: Product[] = [{ id: "papa-amarilla", name: "Papa amarilla", category: "tuberculos", vendorId: "puesto-40", unit: "Saco", format: "Saco", weightKg: 50, price: 80, quality: "Primera", availability: "disponible", desc: "", image: null, imagePath: null, active: true }];
const vendors: Vendor[] = [{ id: "puesto-40", name: "Papas · Puesto 40", stall: "40", pavilion: "Papas", specialty: "", contact: "", phone: "", schedule: "", verified: false, active: true, rating: 0 }];
const cart = [{ productId: "papa-amarilla", qty: 2, note: "" }];
const answer = { zona: "Lurín Cercado", armo_sin_ayuda: true, satisfaccion: 4, lo_usaria: "si", servicio_preferido: "tipo1", precio_justo: "", comentario: "", whatsapp: "" };

beforeEach(() => {
  sessionStorage.clear(); localStorage.clear();
  window.history.replaceState({}, "", "/");
  vi.restoreAllMocks(); insert.mockReset(); insert.mockResolvedValue({ error: null });
});

describe("carrito de encuesta anónimo", () => {
  it("sin ?e= conserva el checkout normal, incluso con un encuestador antiguo", () => {
    localStorage.setItem("mct_encuestador", "fernando");
    trackAppOpen();
    expect(isSurveyMode()).toBe(false);
    finishTrialCart(cart, products, vendors);
    expect(opinionTracking().carrito_resumen).toBeNull();
  });
  it("?e= activa la encuesta y la conserva al navegar sin el parámetro", () => {
    window.history.replaceState({}, "", "/?e=fernando"); trackAppOpen();
    window.history.replaceState({}, "", "/carrito");
    expect(isSurveyMode()).toBe(true);
    expect(opinionTracking().codigo_encuestador).toBe("fernando");
  });
  it("detiene el cronómetro al terminar, sin sumar el tiempo de la opinión", () => {
    const now = vi.spyOn(Date, "now").mockReturnValue(1_000_000);
    window.history.replaceState({}, "", "/?e=moises"); trackAppOpen();
    now.mockReturnValue(1_123_000); finishTrialCart(cart, products, vendors);
    now.mockReturnValue(1_500_000);
    expect(opinionTracking().tiempo_segundos).toBe(123);
    expect(opinionTracking().order_code).toBeNull();
  });
  it("resume productos, cantidades, puestos y total de productos", () => {
    const summary = trialCartSummary(cart, products, vendors);
    expect(summary).toContain("Papa amarilla [papa-amarilla] · 2 × Saco");
    expect(summary).toContain("Papas · Puesto 40 (puesto 40)");
    expect(summary).toContain("Total productos: S/ 160.00");
  });
  it("guarda la prueba solamente en opinions y limpia la medición al enviarla", async () => {
    window.history.replaceState({}, "", "/?e=fernando"); trackAppOpen();
    finishTrialCart(cart, products, vendors);
    await submitOpinion(answer);
    const { supabase } = await import("@/integrations/supabase/client");
    expect(supabase.from).toHaveBeenLastCalledWith("opinions");
    expect(insert).toHaveBeenCalledWith(expect.objectContaining({ carrito_resumen: trialCartSummary(cart, products, vendors), order_code: null, codigo_encuestador: "fernando" }));
    expect(opinionTracking().carrito_resumen).toBeNull();
    window.history.replaceState({}, "", "/carrito"); expect(isSurveyMode()).toBe(false);
  });
  it("conserva el resumen y el tiempo si falla el envío, para reintentar", async () => {
    window.history.replaceState({}, "", "/?e=fernando"); trackAppOpen(); finishTrialCart(cart, products, vendors);
    insert.mockResolvedValue({ error: new Error("offline") });
    await expect(submitOpinion(answer)).rejects.toThrow("offline");
    expect(opinionTracking().carrito_resumen).toBe(trialCartSummary(cart, products, vendors));
    expect(opinionTracking().tiempo_segundos).toBe(0);
  });
  it("incluye carrito_resumen en el CSV y escapa los saltos de línea", () => {
    const summary = trialCartSummary(cart, products, vendors);
    const csv = toCSV([{ id: "x", created_at: "", zona: null, armo_sin_ayuda: true, tiempo_segundos: 123, satisfaccion: 4, lo_usaria: "si", servicio_preferido: "tipo1", precio_justo: null, comentario: null, whatsapp: null, codigo_encuestador: "fernando", order_code: null, carrito_resumen: summary }]);
    expect(csv.split("\n")[0]).toContain("carrito_resumen,tipo_entrega");
    expect(csv).toContain(`"${summary}",tipo1`);
  });
});