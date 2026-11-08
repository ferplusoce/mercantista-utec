import { describe, expect, it } from "vitest";
import { isCustomerProduct, matchPhotoId, photoTypeSchema } from "./catalog-photos";
import { productFormSchema } from "./admin";
import { cartSummary } from "./store";
import { pickTopProducts } from "./catalog";
import type { Product } from "./data";

const draft: Product = { id: "fresa", name: "Fresa", category: "frutas", vendorId: "dona-elena", unit: "Jaba", format: "Jaba", weightKg: 0, price: 0, quality: "Primera", availability: "por_confirmar", desc: "", active: true, image: null, imagePath: null };
describe("Fotos y productos pendientes de Unicachi", () => {
  it("oculta precio 0 a clientes, incluso en los más pedidos y carrito", () => {
    expect(isCustomerProduct(draft)).toBe(false);
    expect(pickTopProducts([draft], ["fresa"])).toEqual([]);
    expect(cartSummary([{ productId: "fresa", qty: 1, note: "" }], [draft]).lines).toEqual([]);
    expect(isCustomerProduct({ ...draft, price: 35 })).toBe(true);
  });
  it("admite precio 0 solo por confirmar y exige peso antes de poner precio", () => {
    expect(productFormSchema.safeParse(draft).success).toBe(true);
    expect(productFormSchema.safeParse({ ...draft, availability: "disponible" }).success).toBe(false);
    expect(productFormSchema.safeParse({ ...draft, price: 35 }).success).toBe(false);
    expect(productFormSchema.safeParse({ ...draft, price: 35, weightKg: 20 }).success).toBe(true);
  });
  it("asigna fotos al id exacto del producto o categoría", () => {
    expect(matchPhotoId("papa-canchan.jpg", ["papa-canchan", "papa-amarilla"])).toBe("papa-canchan");
    expect(matchPhotoId("tuberculos.jpg", ["tuberculos", "frutas"])).toBe("tuberculos");
    expect(matchPhotoId("otra-foto.jpg", ["frutas"])).toBe("");
  });
  it("acepta únicamente los dos tipos solicitados", () => {
    expect(photoTypeSchema.safeParse("puesto").success).toBe(true);
    expect(photoTypeSchema.safeParse("referencial").success).toBe(true);
    expect(photoTypeSchema.safeParse("otro").success).toBe(false);
  });
});